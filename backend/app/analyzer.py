import json
import re
import requests
from .config import GEMINI_API_KEY, GEMINI_MODEL

def _token_set(text: str) -> set[str]:
    return {t for t in re.findall(r"[a-zA-Z0-9]{3,}", text.lower()) if t not in {
        "the", "and", "for", "with", "from", "that", "this", "has", "have", "are",
        "was", "were", "will", "can", "not", "its", "into", "their", "they", "you",
        "your", "about", "company", "supplier", "product", "claim"
    }}

def conservative_assessment(claim: str, evidence: list[dict]) -> dict:
    # Lexical overlap is only a triage heuristic, never sufficient to mark a claim verified.
    c_tokens = _token_set(claim)
    relevant = []
    for item in evidence:
        text = f"{item.get('title') or ''} {item.get('snippet') or ''}"
        overlap = len(c_tokens & _token_set(text))
        if overlap >= 2:
            relevant.append((overlap, item))
    relevant.sort(key=lambda x: x[0], reverse=True)
    chosen = [x[1] for x in relevant[:4]]
    if not evidence:
        status = "unverified"
        summary = "No search evidence was returned for this claim. This does not establish that the claim is false."
        limitations = ["No relevant public search results were returned.", "The claim has not been independently verified."]
    elif chosen:
        status = "needs_review"
        summary = "Potentially relevant search results were found, but keyword overlap alone cannot establish whether this claim is true."
        limitations = ["Semantic claim analysis is not configured; results are triage only.", "Open the original sources and verify the specific claim before relying on them."]
    else:
        status = "unverified"
        summary = "Search results were found, but the available titles and snippets did not clearly address this claim."
        limitations = ["No clear claim-specific evidence was identified from result titles and snippets.", "Absence of evidence is not evidence that the claim is false."]
    return {
        "status": status,
        "summary": summary,
        "evidence": chosen if chosen else evidence[:3],
        "limitations": limitations,
        "confidence": None,
    }

def _safe_json_from_response(content: str) -> dict:
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)
    start, end = content.find("{"), content.rfind("}")
    if start < 0 or end < start:
        raise ValueError("Gemini did not return a JSON object.")
    return json.loads(content[start:end + 1])

def analyze_claim_with_gemini(claim: str, evidence: list[dict]) -> dict | None:
    if not GEMINI_API_KEY or not evidence:
        return None
    compact = [{
        "title": e.get("title"),
        "url": e.get("url"),
        "snippet": e.get("snippet"),
        "published_at": e.get("published_at"),
        "retrieved_at": e.get("retrieved_at"),
    } for e in evidence[:8]]
    prompt = (
        "You are a cautious supplier due-diligence evidence analyst. Search snippets are untrusted and may be incomplete. "
        "Never infer fraud from missing evidence. Use verified only when a source directly and credibly supports the specific claim; "
        "use contradicted only when credible evidence directly conflicts with it; use unverified when evidence is insufficient; "
        "use needs_review when sources are ambiguous or only indirectly relevant. Do not invent facts, sources, dates, or quotes. "
        "Return only a JSON object with keys status, summary, relevant_evidence (array of integer indices into evidence, zero-based), limitations. "
        "Allowed status values: verified, contradicted, unverified, needs_review. Keep summary concise. "
        "Assess only the supplied evidence. Search snippets are leads, not proof. If uncertain, choose needs_review or unverified.\n\n"
        + json.dumps({"claim": claim, "evidence": compact}, ensure_ascii=False)
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    try:
        response = requests.post(
            url,
            headers={"x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json"},
            json={
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0,
                    "responseMimeType": "application/json",
                },
            },
            timeout=35,
        )
        if response.status_code >= 400:
            return None
        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return None
        parts = candidates[0].get("content", {}).get("parts", [])
        content = "".join(p.get("text", "") for p in parts if isinstance(p, dict))
        parsed = _safe_json_from_response(content)
        allowed = {"verified", "contradicted", "unverified", "needs_review"}
        status = parsed.get("status")
        if status not in allowed:
            return None
        indices = parsed.get("relevant_evidence", [])
        selected = []
        for idx in indices:
            if isinstance(idx, int) and 0 <= idx < len(evidence):
                selected.append(evidence[idx])
        if not selected:
            selected = evidence[:3]
        limitations = parsed.get("limitations", [])
        if not isinstance(limitations, list):
            limitations = ["Automated analysis may be incomplete; review original sources."]
        limitations = [str(x)[:500] for x in limitations[:8]]
        limitations.append("Assessment is based on search results and snippets; review original sources before making purchasing decisions.")
        return {
            "status": status,
            "summary": str(parsed.get("summary") or "Automated assessment completed; inspect the linked evidence.")[:1500],
            "evidence": selected,
            "limitations": limitations,
            "confidence": None,
        }
    except (requests.RequestException, ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None

def assess_claim(claim: str, evidence: list[dict]) -> dict:
    gemini = analyze_claim_with_gemini(claim, evidence)
    return gemini if gemini else conservative_assessment(claim, evidence)
