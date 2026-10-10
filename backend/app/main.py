from datetime import datetime, timezone
from uuid import uuid4
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import CORS_ORIGINS, CORS_ORIGIN_REGEX, MAX_CLAIMS, SERPAPI_API_KEY, GEMINI_API_KEY
from .db import init_db, save_investigation, get_investigation, list_investigations
from .models import CreateInvestigationRequest, CompareRequest
from .search import search_claim, search_news, SearchConfigurationError, SearchProviderError, utc_now
from .analyzer import assess_claim

app = FastAPI(
    title="VendorLens API",
    version="1.0.0",
    description="Supplier due-diligence API using live SerpApi search and cautious evidence analysis.",
)

app.add_middleware(
       CORSMiddleware,
       allow_origins=CORS_ORIGINS,
       allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
       allow_credentials=False,
       allow_methods=["*"],
       allow_headers=["*"],
   )

@app.on_event("startup")
def startup() -> None:
    init_db()

@app.get("/")
def root():
    return {"name": "VendorLens API", "status": "ok", "docs": "/docs"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "detail": "VendorLens backend is reachable.",
        "serpapi_configured": bool(SERPAPI_API_KEY),
        "semantic_analysis_configured": bool(GEMINI_API_KEY),
    }

def _safe_website(value: str | None) -> str | None:
    """Normalize common malformed website inputs before storing/searching."""
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    if not value.startswith(("http://", "https://")):
        value = "https://" + value
    # Repair duplicated inputs such as https://example.com/https://example.com/
    import re
    match = re.match(r"^(https?://[^/]+)/(https?://.*)$", value, flags=re.I)
    if match:
        value = match.group(1)
    try:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return None
        # Avoid persisting query strings/fragments as part of the company website.
        path = parsed.path or "/"
        return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{path}".rstrip("/") + "/"
    except Exception:
        return None

def _supplier_facts(evidence: list[dict], website: str | None) -> list[dict]:
    facts = []
    if website:
        facts.append({
            "label": "User-provided website",
            "value": website,
            "kind": "fact",
            "source": website,
        })
    domains = []
    for item in evidence:
        domain = item.get("domain")
        if domain and domain not in domains:
            domains.append(domain)
    if domains:
        facts.append({
            "label": "Domains found in search",
            "value": ", ".join(domains[:8]),
            "kind": "fact",
            "source": None,
        })
    return facts

def _build_summary(claims: list[dict], has_search: bool) -> dict:
    counts = {s: sum(1 for c in claims if c["status"] == s) for s in ["verified", "contradicted", "unverified", "needs_review"]}
    key_findings = []
    unresolved = []
    for c in claims:
        if c["status"] in ("verified", "contradicted"):
            key_findings.append(f'{c["status"].replace("_", " ").title()}: {c["claim"]} — {c.get("summary") or "See linked evidence."}')
        else:
            unresolved.append(c["claim"])
    if not key_findings:
        overview = "The investigation collected public search evidence, but the available material does not establish a definitive conclusion for the claims assessed."
    else:
        overview = f"Assessment completed for {len(claims)} claim(s). {counts['verified']} marked verified and {counts['contradicted']} marked contradicted by the evidence analysis; review each source before acting."
    limitations = [
        "Search results and snippets may be incomplete, outdated, or misleading; open the original sources.",
        "This report is decision support, not a guarantee of supplier legitimacy or a legal/compliance opinion.",
        "A missing search result does not prove that a claim is false.",
    ]
    if not GEMINI_API_KEY:
        limitations.append("GEMINI_API_KEY is not configured. Conservative keyword triage was used; claims are not marked verified by that fallback.")
    if not has_search:
        limitations.append("No live search results were available.")
    return {"overview": overview, "key_findings": key_findings[:12], "unresolved_questions": unresolved[:20], "limitations": limitations}

@app.post("/api/investigations")
def create_investigation(body: CreateInvestigationRequest):
    if len(body.claims) > MAX_CLAIMS:
        raise HTTPException(status_code=422, detail=f"Your current backend limit is {MAX_CLAIMS} claims per investigation. Reduce the number of claims or change MAX_CLAIMS_PER_INVESTIGATION in .env.")
    if not SERPAPI_API_KEY:
        raise HTTPException(status_code=503, detail="Live search is not configured. Add SERPAPI_API_KEY to backend/.env and restart the backend. Demo Mode in the frontend does not require this key.")

    created_at = utc_now()
    inv_id = str(uuid4())
    supplier_name = body.supplier_name.strip()
    website = _safe_website(body.website)
    claim_assessments = []
    all_evidence = []
    search_warnings = []
    news_evidence = []

    # Search each claim independently, so evidence is tied to the exact question.
    for index, claim in enumerate(body.claims, start=1):
        try:
            evidence = search_claim(
                supplier_name=supplier_name,
                claim=claim,
                category=body.category,
                region=body.region,
                website=website or "",
            )
        except SearchConfigurationError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except SearchProviderError as exc:
            search_warnings.append(f"Search for claim {index} failed: {exc}")
            evidence = []

        # Avoid mixing evidence between claims without a traceable relation.
        for e in evidence:
            e["id"] = f"claim-{index}-{e['id']}"
        assessment = assess_claim(claim, evidence)
        claim_assessments.append({
            "id": f"claim-{index}",
            "claim": claim,
            "status": assessment["status"],
            "summary": assessment["summary"],
            "evidence": assessment["evidence"],
            "limitations": assessment["limitations"],
            "confidence": assessment.get("confidence"),
            "last_checked": utc_now(),
        })
        all_evidence.extend(evidence)

    # One news search per investigation is supplementary context, not automatically proof of any claim.
    try:
        news_evidence = search_news(supplier_name, body.claims, body.region)
        for idx, item in enumerate(news_evidence, start=1):
            item["id"] = f"news-{idx}"
            item["classification"] = "neutral"
    except (SearchConfigurationError, SearchProviderError) as exc:
        search_warnings.append(f"Supplementary news search unavailable: {exc}")

    # Attach relevant news only where a basic supplier/claim token overlap exists.
    supplier_tokens = set(supplier_name.lower().split())
    for claim_item in claim_assessments:
        claim_tokens = set(claim_item["claim"].lower().split())
        relevant_news = []
        for news in news_evidence:
            haystack = f'{news.get("title") or ""} {news.get("snippet") or ""}'.lower()
            if any(t in haystack for t in supplier_tokens if len(t) > 2) or any(t in haystack for t in claim_tokens if len(t) > 4):
                relevant_news.append(news)
        for news in relevant_news[:2]:
            if all(e.get("url") != news.get("url") for e in claim_item["evidence"]):
                claim_item["evidence"].append(news)

    # News can be useful context, but is not used to silently change claim status after analysis.
    status = "completed" if not search_warnings else ("completed" if any(c["evidence"] for c in claim_assessments) else "failed")
    summary = _build_summary(claim_assessments, bool(all_evidence))
    if search_warnings:
        summary["limitations"].extend(search_warnings[:5])
    if news_evidence:
        summary["limitations"].append("News results are supplementary context and were not treated as proof of a claim without claim-specific analysis.")

    data = {
        "id": inv_id,
        "origin": "live",
        "status": status,
        "created_at": created_at,
        "supplier": {
            "name": supplier_name,
            "website": website,
            "category": body.category.strip(),
            "region": body.region.strip() or None,
            "description": body.description.strip() or None,
            "facts": _supplier_facts(all_evidence + news_evidence, website),
        },
        "claims": claim_assessments,
        "summary": summary,
        "next_steps": [
            "Open each original source and confirm that it directly supports or contradicts the specific claim.",
            "Request primary documents for certifications, authorizations, and technical specifications.",
            "Confirm product model, quantity, price, delivery terms, and warranty directly with the supplier.",
            "Resolve conflicting or missing evidence before making a purchasing decision.",
        ],
        "additional_context": body.additional_context.strip() or None,
        "report_available": False,
    }
    save_investigation(data)
    return {"id": inv_id, "status": status}

@app.get("/api/investigations")
def get_investigations():
    items = list_investigations()
    out = []
    for item in items:
        claims = item.get("claims", [])
        counts = {s: sum(1 for c in claims if c.get("status") == s) for s in ["verified", "contradicted", "unverified", "needs_review"]}
        out.append({
            "id": item["id"],
            "origin": "live",
            "supplier_name": item.get("supplier", {}).get("name", "Unknown supplier"),
            "category": item.get("supplier", {}).get("category", "Uncategorised"),
            "created_at": item.get("created_at"),
            "status": item.get("status", "completed"),
            "claim_count": len(claims),
            "counts": counts,
            "report_available": item.get("report_available", False),
        })
    return out

@app.get("/api/investigations/{inv_id}")
def get_one_investigation(inv_id: str):
    item = get_investigation(inv_id)
    if not item:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    return item

@app.post("/api/compare")
def compare_vendors(body: CompareRequest):
    if len(set(body.investigation_ids)) != len(body.investigation_ids):
        raise HTTPException(status_code=422, detail="Choose distinct investigations for comparison.")
    rows = []
    for inv_id in body.investigation_ids:
        item = get_investigation(inv_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"Investigation '{inv_id}' was not found.")
        claims = item.get("claims", [])
        verified = sum(1 for c in claims if c.get("status") == "verified")
        unresolved = sum(1 for c in claims if c.get("status") in ("unverified", "needs_review", "contradicted"))
        evidence = [e for c in claims for e in c.get("evidence", [])]
        unique_sources = []
        seen_urls = set()
        for e in evidence:
            url = e.get("url")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append({"title": e.get("title") or "Source", "url": url})
        rows.append({
            "investigation_id": item["id"],
            "supplier_name": item.get("supplier", {}).get("name", "Unknown supplier"),
            "product": item.get("supplier", {}).get("description") or item.get("supplier", {}).get("category"),
            "pricing_evidence": None,
            "spec_compatibility": None,
            "verified_claims": verified,
            "unresolved_claims": unresolved,
            "evidence_quality": f"{len(unique_sources)} unique linked source(s); inspect source quality manually.",
            "sources": unique_sources[:12],
        })
    notes = [
        "VendorLens does not rank suppliers as safe or fraudulent based only on public search results.",
        "Pricing and specification compatibility are shown as unavailable unless the investigation has explicit comparable evidence.",
        "A higher source count does not automatically mean stronger evidence.",
    ]
    return {"origin": "live", "rows": rows, "notes": notes}

@app.exception_handler(Exception)
async def unexpected_error_handler(request, exc):
    # Avoid leaking stack traces, keys, or internal paths to the browser.
    return JSONResponse(status_code=500, content={"detail": "Unexpected backend error. Check the backend terminal logs for details."})
