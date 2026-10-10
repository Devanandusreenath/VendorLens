import { createFileRoute, Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/States";
import { SampleTag } from "@/components/shared/StatusBadge";
import { useInvestigations } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — VendorLens" },
      { name: "description", content: "Supplier intelligence reports from completed investigations." },
      { property: "og:title", content: "Reports — VendorLens" },
      { property: "og:description", content: "Supplier intelligence reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const q = useInvestigations();
  const reports = (q.data ?? []).filter((i) => i.status === "completed");
  return (
    <AppShell>
      <PageHeader title="Reports" description="Reports from completed investigations. Use “Export report” on a report page to print or save it as PDF from your browser." />
      <section className="surface-card p-5">
        {q.isLoading ? <TableSkeleton /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> : reports.length === 0 ? (
          <EmptyState title="No reports yet" description="Reports appear once an investigation has completed." />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Supplier</th>
                  <th className="px-3 py-2.5 font-medium">Report date</th>
                  <th className="px-3 py-2.5 font-medium">Reference</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium"><span className="flex items-center gap-2">{r.supplier_name}{r.origin === "sample" && <SampleTag />}</span></td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(r.created_at)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild><Link to="/investigations/$id" params={{ id: r.id }}>View report</Link></Button>
                        <Button variant="ghost" size="sm" disabled title="Server-side PDF generation is not implemented yet"><FileDown className="h-4 w-4" /> PDF unavailable</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
