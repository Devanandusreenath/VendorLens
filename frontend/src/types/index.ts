export type ClaimStatus = "verified" | "contradicted" | "unverified" | "needs_review";
export type EvidenceClassification = "supporting" | "contradicting" | "neutral";
export type InvestigationStatus = "pending" | "running" | "completed" | "failed" | "not_run";
export type DataOrigin = "live" | "sample";

export interface EvidenceItem {
  id: string;
  title: string;
  url: string | null;
  domain: string | null;
  snippet: string | null;
  published_at: string | null;
  event_date: string | null;
  retrieved_at: string | null;
  classification: EvidenceClassification;
  relevance: string | null;
}

export interface Confidence {
  label: string;
  methodology: string;
}

export interface ClaimAssessment {
  id: string;
  claim: string;
  status: ClaimStatus;
  summary: string | null;
  evidence: EvidenceItem[];
  limitations: string[];
  confidence: Confidence | null;
  last_checked: string | null;
}

export interface SupplierFact {
  label: string;
  value: string | null;
  kind: "fact" | "inference";
  source: string | null;
}

export interface Supplier {
  name: string;
  website: string | null;
  category: string;
  region: string | null;
  description: string | null;
  facts: SupplierFact[];
}

export interface InvestigationSummary {
  overview: string | null;
  key_findings: string[];
  unresolved_questions: string[];
  limitations: string[];
}

export interface Investigation {
  id: string;
  origin: DataOrigin;
  status: InvestigationStatus;
  created_at: string;
  supplier: Supplier;
  claims: ClaimAssessment[];
  summary: InvestigationSummary;
  next_steps: string[];
  additional_context: string | null;
  report_available: boolean;
}

export interface InvestigationListItem {
  id: string;
  origin: DataOrigin;
  supplier_name: string;
  category: string;
  created_at: string;
  status: InvestigationStatus;
  claim_count: number;
  counts: Record<ClaimStatus, number>;
  report_available: boolean;
}

export interface CreateInvestigationRequest {
  supplier_name: string;
  website: string;
  category: string;
  region: string;
  description: string;
  claims: string[];
  additional_context: string;
}

export interface ComparisonRow {
  investigation_id: string;
  supplier_name: string;
  product: string | null;
  pricing_evidence: string | null;
  spec_compatibility: string | null;
  verified_claims: number;
  unresolved_claims: number;
  evidence_quality: string | null;
  sources: { title: string; url: string | null }[];
}

export interface VendorComparison {
  origin: DataOrigin;
  rows: ComparisonRow[];
  notes: string[];
}

export interface HealthStatus {
  ok: boolean;
  detail: string;
}
