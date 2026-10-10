import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { ClaimStatus, EvidenceClassification, InvestigationStatus } from "@/types";
import { cn } from "@/lib/utils";

const CLAIM = {
  verified: { label: "Verified", icon: CheckCircle2, cls: "bg-verified-soft text-verified border-verified/20" },
  contradicted: { label: "Contradicted", icon: XCircle, cls: "bg-contradicted-soft text-contradicted border-contradicted/20" },
  unverified: { label: "Unverified", icon: CircleDashed, cls: "bg-unverified-soft text-unverified border-unverified/20" },
  needs_review: { label: "Needs review", icon: AlertTriangle, cls: "bg-review-soft text-review border-review/25" },
} as const;

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  verified: "Verified",
  contradicted: "Contradicted",
  unverified: "Unverified",
  needs_review: "Needs review",
};

export function ClaimStatusBadge({ status, className }: { status: ClaimStatus; className?: string }) {
  const s = CLAIM[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium", s.cls, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {s.label}
    </span>
  );
}

const INV: Record<InvestigationStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-accent text-accent-foreground" },
  running: { label: "Running", cls: "bg-accent text-accent-foreground" },
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  failed: { label: "Failed", cls: "bg-contradicted-soft text-contradicted" },
  not_run: { label: "Not run (demo)", cls: "bg-demo-soft text-demo" },
};

export function InvestigationStatusBadge({ status }: { status: InvestigationStatus }) {
  const s = INV[status];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

const EV: Record<EvidenceClassification, { label: string; cls: string }> = {
  supporting: { label: "Supporting", cls: "text-verified bg-verified-soft" },
  contradicting: { label: "Contradicting", cls: "text-contradicted bg-contradicted-soft" },
  neutral: { label: "Neutral / context", cls: "text-unverified bg-unverified-soft" },
};

export function EvidenceBadge({ kind }: { kind: EvidenceClassification }) {
  return <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", EV[kind].cls)}>{EV[kind].label}</span>;
}

export function SampleTag({ className }: { className?: string }) {
  return (
    <span className={cn("rounded border border-demo/30 bg-demo-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-demo", className)}>
      Sample
    </span>
  );
}
