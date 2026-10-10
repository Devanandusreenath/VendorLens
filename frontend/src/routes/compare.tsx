import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/States";
import { SampleTag } from "@/components/shared/StatusBadge";
import { useComparison, useInvestigations } from "@/lib/queries";
import { safeUrl } from "@/lib/format";
import type { ComparisonRow } from "@/types";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Vendor Comparison — VendorLens" },
      { name: "description", content: "Compare two or three suppliers side by side, with missing information highlighted." },
      { property: "og:title", content: "Vendor Comparison — VendorLens" },
      { property: "og:description", content: "Side-by-side supplier evidence comparison." },
    ],
  }),
  component: ComparePage,
});

function Missing() {
  return <span className="rounded bg-review-soft px-1.5 py-0.5 text-xs font-medium text-review">Not available</span>;
}

const ROWS: { label: string; render: (r: ComparisonRow) => React.ReactNode }[] = [
  { label: "Product / service", render: (r) => r.product ?? <Missing /> },
  { label: "Pricing evidence", render: (r) => r.pricing_evidence ?? <Missing /> },
  { label: "Specification compatibility", render: (r) => r.spec_compatibility ?? <Missing /> },
  { label: "Verified claims", render: (r) => <span className="font-mono text-verified">{r.verified_claims}</span> },
  { label: "Unresolved claims", render: (r) => <span className="font-mono text-review">{r.unresolved_claims}</span> },
  { label: "Evidence quality", render: (r) => r.evidence_quality ?? <Missing /> },
  {
    label: "Source links",
    render: (r) =>
      r.sources.length === 0 ? <Missing /> : (
        <ul className="space-y-1">{r.sources.map((s) => { const u = safeUrl(s.url); return <li key={s.title}>{u ? <a href={u} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">{s.title}<ExternalLink className="h-3 w-3" /></a> : s.title}</li>; })}</ul>
      ),
  },
];

function ComparePage() {
  const list = useInvestigations();
  const [ids, setIds] = useState<string[]>([]);
  const cmp = useComparison(ids);
  const toggle = (id: string) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));

  return (
    <AppShell>
      <PageHeader title="Vendor comparison" description="Select two or three investigated suppliers. The cheapest option is not assumed to be the best, and missing data is highlighted rather than guessed." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <section className="surface-card p-5">
          <h2 className="text-sm font-semibold">Select suppliers <span className="font-normal text-muted-foreground">({ids.length}/3)</span></h2>
          {list.isLoading ? <div className="mt-4"><TableSkeleton rows={3} /></div> : list.isError ? <div className="mt-4"><ErrorState message={(list.error as Error).message} onRetry={() => list.refetch()} /></div> : (
            <ul className="mt-4 space-y-2">
              {(list.data ?? []).map((i) => (
                <li key={i.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50 has-[:checked]:border-primary">
                    <Checkbox checked={ids.includes(i.id)} onCheckedChange={() => toggle(i.id)} disabled={!ids.includes(i.id) && ids.length >= 3} className="mt-0.5" />
                    <span className="min-w-0 text-sm"><span className="block font-medium">{i.supplier_name}</span><span className="font-mono text-[11px] text-muted-foreground">{i.id}</span></span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="surface-card overflow-hidden">
          {ids.length < 2 ? (
            <div className="p-5"><EmptyState title="Select at least two suppliers" description="The comparison will appear here once two or three suppliers are selected." /></div>
          ) : cmp.isLoading ? <div className="p-5"><TableSkeleton rows={6} /></div> : cmp.isError ? (
            <div className="p-5"><ErrorState message={(cmp.error as Error).message} onRetry={() => cmp.refetch()} /></div>
          ) : cmp.data ? (
            <>
              {cmp.data.origin === "sample" && (
                <div className="flex items-center gap-2 border-b bg-demo-soft px-5 py-2.5 text-xs text-demo"><SampleTag />Sample comparison — the comparison feature requires the backend for real results.</div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="w-48 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Supplier</th>
                      {cmp.data.rows.map((r) => <th key={r.investigation_id} className="px-4 py-3 font-semibold">{r.supplier_name}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ROWS.map((row) => (
                      <tr key={row.label} className="align-top">
                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">{row.label}</th>
                        {cmp.data!.rows.map((r) => <td key={r.investigation_id} className="px-4 py-3">{row.render(r)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cmp.data.notes.length > 0 && <ul className="border-t px-5 py-3 text-xs text-muted-foreground">{cmp.data.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
            </>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
