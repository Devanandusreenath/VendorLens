import { Link } from "@tanstack/react-router";
import type { InvestigationListItem } from "@/types";
import { formatDate } from "@/lib/format";
import { InvestigationStatusBadge, SampleTag } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

export function StatusSummary({ counts }: { counts: InvestigationListItem["counts"] }) {
  const parts = [
    { n: counts.verified, cls: "bg-verified", label: "verified" },
    { n: counts.contradicted, cls: "bg-contradicted", label: "contradicted" },
    { n: counts.needs_review, cls: "bg-review", label: "needs review" },
    { n: counts.unverified, cls: "bg-unverified", label: "unverified" },
  ];
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
      {parts.map((p) => (
        <span key={p.label} className="inline-flex items-center gap-1" title={`${p.n} ${p.label}`}>
          <span className={`h-2 w-2 rounded-full ${p.cls}`} />
          {p.n}
          <span className="sr-only">{p.label}</span>
        </span>
      ))}
    </div>
  );
}

export function InvestigationsTable({ items }: { items: InvestigationListItem[] }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">Supplier</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">Claims</th>
            <th className="px-3 py-2.5 font-medium">Status summary</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((i) => (
            <tr key={i.id} className="hover:bg-muted/50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2 font-medium">{i.supplier_name}{i.origin === "sample" && <SampleTag />}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{i.id} · {i.category}</div>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{formatDate(i.created_at)}</td>
              <td className="px-3 py-3">{i.claim_count}</td>
              <td className="px-3 py-3"><StatusSummary counts={i.counts} /></td>
              <td className="px-3 py-3"><InvestigationStatusBadge status={i.status} /></td>
              <td className="px-5 py-3 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/investigations/$id" params={{ id: i.id }}>View report</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
