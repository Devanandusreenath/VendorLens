import { API_BASE_URL, ENDPOINTS } from "./config";
import type {
  ClaimAssessment,
  ClaimStatus,
  ComparisonRow,
  CreateInvestigationRequest,
  EvidenceClassification,
  EvidenceItem,
  HealthStatus,
  Investigation,
  InvestigationListItem,
  InvestigationStatus,
  SupplierFact,
  VendorComparison,
} from "@/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "No backend is configured. Set VITE_API_BASE_URL or switch to Demo Mode in Settings.",
    );
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("The VendorLens backend could not be reached. Check that it is running.");
  }
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}.`;
    try {
      const body = await res.json();
      if (body && typeof body.detail === "string") detail = body.detail;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

/* ---------- Defensive parsing (adapter between backend shape and UI types) ---------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = { [k: string]: any };
const obj = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {});
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strArr = (v: unknown): string[] => arr(v).map(str).filter((s): s is string => !!s);

const CLAIM_STATUSES: ClaimStatus[] = ["verified", "contradicted", "unverified", "needs_review"];
const INV_STATUSES: InvestigationStatus[] = ["pending", "running", "completed", "failed", "not_run"];
const CLASSES: EvidenceClassification[] = ["supporting", "contradicting", "neutral"];

function claimStatus(v: unknown): ClaimStatus {
  const s = String(v ?? "").toLowerCase().replace(/[\s-]/g, "_");
  return (CLAIM_STATUSES as string[]).includes(s) ? (s as ClaimStatus) : "needs_review";
}
function invStatus(v: unknown): InvestigationStatus {
  const s = String(v ?? "").toLowerCase();
  return (INV_STATUSES as string[]).includes(s) ? (s as InvestigationStatus) : "pending";
}

function domainOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function parseEvidence(raw: unknown, i: number): EvidenceItem {
  const r = obj(raw);
  const url = str(r["url"]);
  const c = String(r["classification"] ?? "").toLowerCase();
  return {
    id: str(r["id"]) ?? `ev-${i}`,
    title: str(r["title"]) ?? "Untitled source",
    url,
    domain: str(r["domain"]) ?? domainOf(url),
    snippet: str(r["snippet"]),
    published_at: str(r["published_at"]),
    event_date: str(r["event_date"]),
    retrieved_at: str(r["retrieved_at"]),
    classification: (CLASSES as string[]).includes(c) ? (c as EvidenceClassification) : "neutral",
    relevance: str(r["relevance"]),
  };
}

export function parseClaim(raw: unknown, i: number): ClaimAssessment {
  const r = obj(raw);
  const conf = obj(r["confidence"]);
  return {
    id: str(r["id"]) ?? `claim-${i}`,
    claim: str(r["claim"]) ?? "Unnamed claim",
    status: claimStatus(r["status"]),
    summary: str(r["summary"]),
    evidence: arr(r["evidence"]).map(parseEvidence),
    limitations: strArr(r["limitations"]),
    // Only show confidence when the backend documents its methodology.
    confidence:
      str(conf["label"]) && str(conf["methodology"])
        ? { label: str(conf["label"])!, methodology: str(conf["methodology"])! }
        : null,
    last_checked: str(r["last_checked"]) ?? str(r["checked_at"]),
  };
}

export function parseInvestigation(raw: unknown): Investigation {
  const r = obj(raw);
  const s = obj(r["supplier"]);
  const sum = obj(r["summary"]);
  const facts: SupplierFact[] = arr(s["facts"]).map((f) => {
    const fr = obj(f);
    return {
      label: str(fr["label"]) ?? "Detail",
      value: str(fr["value"]),
      kind: fr["kind"] === "inference" ? "inference" : "fact",
      source: str(fr["source"]),
    };
  });
  return {
    id: str(r["id"]) ?? String(r["id"] ?? "unknown"),
    origin: "live",
    status: invStatus(r["status"]),
    created_at: str(r["created_at"]) ?? new Date().toISOString(),
    supplier: {
      name: str(s["name"]) ?? str(r["supplier_name"]) ?? "Unknown supplier",
      website: str(s["website"]),
      category: str(s["category"]) ?? "Uncategorised",
      region: str(s["region"]),
      description: str(s["description"]),
      facts,
    },
    claims: arr(r["claims"]).map(parseClaim),
    summary: {
      overview: str(sum["overview"]) ?? str(r["summary"]),
      key_findings: strArr(sum["key_findings"]),
      unresolved_questions: strArr(sum["unresolved_questions"]),
      limitations: strArr(sum["limitations"] ?? r["limitations"]),
    },
    next_steps: strArr(r["next_steps"] ?? r["recommended_next_steps"]),
    additional_context: str(r["additional_context"]),
    report_available: r["report_available"] === true,
  };
}

export function toListItem(inv: Investigation): InvestigationListItem {
  const counts: Record<ClaimStatus, number> = {
    verified: 0,
    contradicted: 0,
    unverified: 0,
    needs_review: 0,
  };
  inv.claims.forEach((c) => counts[c["status"]]++);
  return {
    id: inv.id,
    origin: inv.origin,
    supplier_name: inv.supplier.name,
    category: inv.supplier.category,
    created_at: inv.created_at,
    status: inv.status,
    claim_count: inv.claims.length,
    counts,
    report_available: inv.report_available,
  };
}

function parseListItem(raw: unknown): InvestigationListItem {
  const r = obj(raw);
  if (Array.isArray(r["claims"])) return toListItem(parseInvestigation(raw));
  const c = obj(r["counts"]);
  return {
    id: str(r["id"]) ?? String(r["id"] ?? ""),
    origin: "live",
    supplier_name: str(r["supplier_name"]) ?? "Unknown supplier",
    category: str(r["category"]) ?? "Uncategorised",
    created_at: str(r["created_at"]) ?? "",
    status: invStatus(r["status"]),
    claim_count: Number(r["claim_count"] ?? 0) || 0,
    counts: {
      verified: Number(c["verified"] ?? 0) || 0,
      contradicted: Number(c["contradicted"] ?? 0) || 0,
      unverified: Number(c["unverified"] ?? 0) || 0,
      needs_review: Number(c["needs_review"] ?? 0) || 0,
    },
    report_available: r["report_available"] === true,
  };
}

/* ---------- Public API ---------- */

export const api = {
  async health(): Promise<HealthStatus> {
    const r = obj(await request<unknown>(ENDPOINTS.health));
    return { ok: true, detail: str(r["status"]) ?? "Backend reachable" };
  },
  async listInvestigations(): Promise<InvestigationListItem[]> {
    const data = await request<unknown>(ENDPOINTS.investigations);
    const items = Array.isArray(data) ? data : arr(obj(data)["items"]);
    return items.map(parseListItem);
  },
  async getInvestigation(id: string): Promise<Investigation> {
    return parseInvestigation(await request<unknown>(ENDPOINTS.investigation(id)));
  },
  async createInvestigation(body: CreateInvestigationRequest): Promise<{ id: string }> {
    const r = obj(
      await request<unknown>(ENDPOINTS.investigations, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    const id = str(r["id"]) ?? (typeof r["id"] === "number" ? String(r["id"]) : null);
    if (!id) throw new ApiError("The backend response did not include an investigation ID.");
    return { id };
  },
  async compare(ids: string[]): Promise<VendorComparison> {
    const r = obj(
      await request<unknown>(ENDPOINTS.compare, {
        method: "POST",
        body: JSON.stringify({ investigation_ids: ids }),
      }),
    );
    const rows: ComparisonRow[] = arr(r["rows"]).map((x) => {
      const o = obj(x);
      return {
        investigation_id: str(o["investigation_id"]) ?? "",
        supplier_name: str(o["supplier_name"]) ?? "Unknown supplier",
        product: str(o["product"]),
        pricing_evidence: str(o["pricing_evidence"]),
        spec_compatibility: str(o["spec_compatibility"]),
        verified_claims: Number(o["verified_claims"] ?? 0) || 0,
        unresolved_claims: Number(o["unresolved_claims"] ?? 0) || 0,
        evidence_quality: str(o["evidence_quality"]),
        sources: arr(o["sources"]).map((s) => ({
          title: str(obj(s)["title"]) ?? "Source",
          url: str(obj(s)["url"]),
        })),
      };
    });
    return { origin: "live", rows, notes: strArr(r["notes"]) };
  },
};
