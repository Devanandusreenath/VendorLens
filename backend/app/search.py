from datetime import datetime, timezone
from urllib.parse import urlparse
import requests
from .config import SERPAPI_API_KEY, SERPAPI_TIMEOUT

SERPAPI_URL = "https://serpapi.com/search.json"

class SearchConfigurationError(Exception):
    pass

class SearchProviderError(Exception):
    pass

def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _domain(url: str | None) -> str | None:
    if not url:
        return None
    try:
        return urlparse(url).hostname.removeprefix("www.")
    except Exception:
        return None

def _call(params: dict) -> dict:
    if not SERPAPI_API_KEY:
        raise SearchConfigurationError(
            "SERPAPI_API_KEY is missing. Add your SerpApi key to backend/.env, then restart the server."
        )

    from .config import SERPAPI_RETRIES
    request_params = {**params, "api_key": SERPAPI_API_KEY}
    last_error = None

    for attempt in range(SERPAPI_RETRIES + 1):
        try:
            response = requests.get(
                SERPAPI_URL,
                params=request_params,
                timeout=(8, SERPAPI_TIMEOUT),
            )
            if response.status_code >= 400:
                try:
                    detail = response.json().get("error", "SerpApi returned an error.")
                except Exception:
                    detail = "SerpApi returned an error."
                # Retry transient server/rate-limit errors only.
                if response.status_code not in (408, 429) and response.status_code < 500:
                    raise SearchProviderError(f"SerpApi error ({response.status_code}): {detail}")
                last_error = f"SerpApi error ({response.status_code}): {detail}"
            else:
                data = response.json()
                if data.get("error"):
                    raise SearchProviderError(f"SerpApi error: {data['error']}")
                return data
        except SearchProviderError:
            raise
        except requests.Timeout as exc:
            last_error = f"request timed out after {SERPAPI_TIMEOUT}s"
        except requests.ConnectionError as exc:
            last_error = "connection error while contacting SerpApi"
        except requests.RequestException as exc:
            last_error = f"network error ({exc.__class__.__name__})"
        except ValueError as exc:
            raise SearchProviderError("SerpApi returned invalid JSON.") from exc

        if attempt < SERPAPI_RETRIES:
            import time
            time.sleep(2 ** attempt)

    raise SearchProviderError(
        f"SerpApi request failed after {SERPAPI_RETRIES + 1} attempt(s): {last_error}. "
        "Check your connection, API key, and SerpApi service status."
    )

def _to_evidence(item: dict, idx: int, classification: str = "neutral") -> dict:
    link = item.get("link") or item.get("url")
    return {
        "id": f"ev-{idx}",
        "title": str(item.get("title") or "Untitled search result")[:500],
        "url": link if isinstance(link, str) and link.startswith(("https://", "http://")) else None,
        "domain": _domain(link),
        "snippet": str(item.get("snippet") or item.get("snippet_highlighted_words") or "")[:1800] or None,
        "published_at": item.get("date") or item.get("published_date"),
        "event_date": None,
        "retrieved_at": utc_now(),
        "classification": classification,
        "relevance": "Search result; relevance and claim support require source-level review.",
    }

def search_claim(supplier_name: str, claim: str, category: str, region: str = "", website: str = "") -> list[dict]:
    # Use a general query first. Site-restricted Google queries have been
    # observed to time out for this project, so avoid making them a dependency.
    parts = [f'"{supplier_name}"', claim, category]
    if region:
        parts.append(region)
    query = " ".join(p.strip() for p in parts if p and p.strip())
    data = _call({
        "engine": "google",
        "q": query,
        "num": 6,
        "hl": "en",
        "gl": "in" if (region and any(x in region.lower() for x in ["india", "kerala", "chennai", "mumbai", "delhi", "bangalore"])) else "us",
    })
    items = data.get("organic_results") or []
    evidence = []
    for idx, item in enumerate(items[:6], start=1):
        evidence.append(_to_evidence(item, idx))
    # Include knowledge graph details only as context if returned; do not treat them as claim proof.
    kg = data.get("knowledge_graph")
    if isinstance(kg, dict) and (kg.get("title") or kg.get("description")):
        evidence.append({
            "id": f"kg-{len(evidence)+1}",
            "title": str(kg.get("title") or f"Knowledge panel: {supplier_name}")[:500],
            "url": kg.get("website") if isinstance(kg.get("website"), str) and kg.get("website", "").startswith(("http://", "https://")) else None,
            "domain": _domain(kg.get("website")),
            "snippet": str(kg.get("description") or "")[:1800] or None,
            "published_at": None,
            "event_date": None,
            "retrieved_at": utc_now(),
            "classification": "neutral",
            "relevance": "Search knowledge panel; contextual information, not independent verification.",
        })
    return evidence

def search_news(supplier_name: str, claims: list[str], region: str = "") -> list[dict]:
    # One news request per investigation keeps search usage bounded.
    claim_text = " ".join(claims[:3])
    q = " ".join(x for x in [supplier_name, claim_text, region] if x).strip()
    data = _call({"engine": "google_news", "q": q, "num": 6, "hl": "en", "gl": "in"})
    items = data.get("news_results") or []
    out = []
    for idx, item in enumerate(items[:6], start=1):
        out.append(_to_evidence(item, idx, "neutral"))
    return out
