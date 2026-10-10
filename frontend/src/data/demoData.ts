/**
 * SAMPLE DATA — for interface preview only.
 * All suppliers, findings and sources below are fictional. No live search was performed.
 * Source URLs are intentionally null so that no fictional link is presented as real evidence.
 */
import type { CreateInvestigationRequest, Investigation, VendorComparison } from "@/types";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

export const demoInvestigations: Investigation[] = [
  {
    id: "SAMPLE-1042",
    origin: "sample",
    status: "completed",
    created_at: daysAgo(2),
    supplier: {
      name: "Northbridge Fasteners (Sample)",
      website: null,
      category: "Industrial components",
      region: "India",
      description: "Fictional supplier of stainless steel fasteners and fixings, used to illustrate a report.",
      facts: [
        { label: "Registered business name", value: "Northbridge Fasteners Pvt. Ltd. (fictional)", kind: "fact", source: "Sample registry record" },
        { label: "Year established", value: "2011", kind: "fact", source: "Sample registry record" },
        { label: "Primary market", value: "Appears to focus on domestic B2B buyers", kind: "inference", source: "Inferred from sample product pages" },
        { label: "Headcount", value: null, kind: "fact", source: null },
      ],
    },
    claims: [
      {
        id: "c1",
        claim: "Holds ISO 9001:2015 certification",
        status: "verified",
        summary: "A sample certification-body listing names the supplier with a current certificate.",
        confidence: null,
        last_checked: daysAgo(2),
        limitations: ["Certificate scope (sites covered) should be confirmed directly with the certification body."],
        evidence: [
          { id: "e1", title: "Certificate directory listing (sample)", url: null, domain: "certbody.example", snippet: "Northbridge Fasteners — ISO 9001:2015 — status: valid.", published_at: daysAgo(120), event_date: daysAgo(400), retrieved_at: daysAgo(2), classification: "supporting", relevance: "Directly names the supplier and standard." },
          { id: "e2", title: "Supplier 'About' page (sample)", url: null, domain: "northbridge.example", snippet: "We are an ISO 9001 certified manufacturer.", published_at: null, event_date: null, retrieved_at: daysAgo(2), classification: "neutral", relevance: "Self-reported; does not independently confirm." },
        ],
      },
      {
        id: "c2",
        claim: "Products meet A4-80 stainless steel grade",
        status: "needs_review",
        summary: "Datasheet states A4-80, but a sample distributor listing shows A2-70 for the same part number.",
        confidence: null,
        last_checked: daysAgo(2),
        limitations: ["Conflicting listings may reflect different product revisions."],
        evidence: [
          { id: "e3", title: "Product datasheet NB-M8 (sample)", url: null, domain: "northbridge.example", snippet: "Material: A4-80 (AISI 316).", published_at: daysAgo(300), event_date: null, retrieved_at: daysAgo(2), classification: "supporting", relevance: "Manufacturer datasheet." },
          { id: "e4", title: "Distributor catalogue entry (sample)", url: null, domain: "distributor.example", snippet: "NB-M8 hex bolt — grade A2-70.", published_at: daysAgo(90), event_date: null, retrieved_at: daysAgo(2), classification: "contradicting", relevance: "Third-party listing with different grade." },
        ],
      },
      {
        id: "c3",
        claim: "Authorised distributor for a named European brand",
        status: "contradicted",
        summary: "The brand's sample distributor directory does not list the supplier and names a different regional partner.",
        confidence: null,
        last_checked: daysAgo(2),
        limitations: ["Directories can be out of date; ask the brand directly."],
        evidence: [
          { id: "e5", title: "Brand partner directory — India (sample)", url: null, domain: "brand.example", snippet: "Authorised partner for India: a different company.", published_at: daysAgo(30), event_date: null, retrieved_at: daysAgo(2), classification: "contradicting", relevance: "Official brand source." },
        ],
      },
      {
        id: "c4",
        claim: "Delivers within 10 business days",
        status: "unverified",
        summary: "No independent evidence about delivery performance was found. This is not evidence of a problem.",
        confidence: null,
        last_checked: daysAgo(2),
        limitations: ["Delivery timelines are rarely documented publicly."],
        evidence: [],
      },
    ],
    summary: {
      overview:
        "Sample report: one claim is supported by a third-party listing, one is contradicted by an official brand directory, one has conflicting evidence, and one could not be checked from public sources.",
      key_findings: [
        "ISO 9001 listing found in a certification directory (sample).",
        "Brand directory names a different authorised partner (sample).",
        "Material grade differs between manufacturer and distributor listings (sample).",
      ],
      unresolved_questions: ["Which product revision does the A2-70 listing refer to?", "What delivery terms will be written into the contract?"],
      limitations: ["Sample data only — no live search was performed.", "Public evidence may be incomplete or outdated."],
    },
    next_steps: [
      "Request a copy of the ISO 9001 certificate including its scope.",
      "Ask the supplier to clarify the authorised-distributor claim and provide a letter from the brand.",
      "Request a mill test certificate for the NB-M8 part.",
      "Confirm delivery terms in an official quotation.",
    ],
    additional_context: null,
    report_available: true,
  },
  {
    id: "SAMPLE-1039",
    origin: "sample",
    status: "completed",
    created_at: daysAgo(6),
    supplier: {
      name: "Meridian Packaging Co. (Sample)",
      website: null,
      category: "Packaging",
      region: "Vietnam",
      description: "Fictional corrugated packaging supplier.",
      facts: [],
    },
    claims: [
      { id: "m1", claim: "FSC chain-of-custody certified", status: "verified", summary: "Sample registry entry found.", confidence: null, last_checked: daysAgo(6), limitations: [], evidence: [] },
      { id: "m2", claim: "Minimum order of 500 units", status: "unverified", summary: "No public evidence found.", confidence: null, last_checked: daysAgo(6), limitations: [], evidence: [] },
      { id: "m3", claim: "Operating since 2008", status: "verified", summary: "Sample registry record.", confidence: null, last_checked: daysAgo(6), limitations: [], evidence: [] },
    ],
    summary: { overview: "Sample report with mostly supported claims.", key_findings: [], unresolved_questions: [], limitations: ["Sample data only."] },
    next_steps: ["Confirm minimum order quantity in writing."],
    additional_context: null,
    report_available: true,
  },
  {
    id: "SAMPLE-1035",
    origin: "sample",
    status: "completed",
    created_at: daysAgo(11),
    supplier: {
      name: "Coastal Electronics Ltd. (Sample)",
      website: null,
      category: "Electronic components",
      region: "Taiwan",
      description: "Fictional electronic components reseller.",
      facts: [],
    },
    claims: [
      { id: "x1", claim: "RoHS compliant product range", status: "needs_review", summary: "Partial evidence covering some product lines.", confidence: null, last_checked: daysAgo(11), limitations: [], evidence: [] },
      { id: "x2", claim: "Franchised distributor of a chip maker", status: "contradicted", summary: "Not listed in sample manufacturer directory.", confidence: null, last_checked: daysAgo(11), limitations: [], evidence: [] },
    ],
    summary: { overview: "Sample report with items requiring review.", key_findings: [], unresolved_questions: [], limitations: ["Sample data only."] },
    next_steps: ["Request RoHS declarations per part number."],
    additional_context: null,
    report_available: false,
  },
];

export const demoActivity = [
  { id: "a1", text: "Sample report generated for Northbridge Fasteners", at: daysAgo(2) },
  { id: "a2", text: "Claim marked 'Needs review' on Northbridge Fasteners", at: daysAgo(2) },
  { id: "a3", text: "Sample report generated for Meridian Packaging Co.", at: daysAgo(6) },
  { id: "a4", text: "Sample investigation created for Coastal Electronics Ltd.", at: daysAgo(11) },
];

export function demoComparison(ids: string[]): VendorComparison {
  const pick = demoInvestigations.filter((i) => ids.includes(i.id));
  return {
    origin: "sample",
    notes: ["Sample comparison — illustrative only. No prices or delivery estimates are invented."],
    rows: pick.map((i) => ({
      investigation_id: i.id,
      supplier_name: i.supplier.name,
      product: i.supplier.category,
      pricing_evidence: null,
      spec_compatibility: i.id === "SAMPLE-1042" ? "Conflicting grade information" : null,
      verified_claims: i.claims.filter((c) => c.status === "verified").length,
      unresolved_claims: i.claims.filter((c) => c.status !== "verified").length,
      evidence_quality: i.id === "SAMPLE-1042" ? "Mixed: official + self-reported (sample)" : null,
      sources: [],
    })),
  };
}

/* Locally stored demo drafts — the user's own input, never analysed. */
const DRAFT_KEY = "vendorlens.demoDrafts";

export function loadDemoDrafts(): Investigation[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveDemoDraft(req: CreateInvestigationRequest): Investigation {
  const id = `DRAFT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const inv: Investigation = {
    id,
    origin: "sample",
    status: "not_run",
    created_at: new Date().toISOString(),
    supplier: {
      name: req.supplier_name,
      website: req.website || null,
      category: req.category,
      region: req.region || null,
      description: req.description || null,
      facts: [],
    },
    claims: req.claims.map((c, i) => ({
      id: `d${i}`,
      claim: c,
      status: "unverified",
      summary: "Not checked — Demo Mode does not run searches. Connect the backend to investigate this claim.",
      evidence: [],
      limitations: ["No search was performed."],
      confidence: null,
      last_checked: null,
    })),
    summary: {
      overview: "This investigation was saved in Demo Mode. No public sources were searched and no findings exist yet.",
      key_findings: [],
      unresolved_questions: [],
      limitations: ["No search was performed in Demo Mode."],
    },
    next_steps: [],
    additional_context: req.additional_context || null,
    report_available: false,
  };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify([inv, ...loadDemoDrafts()]));
  return inv;
}
