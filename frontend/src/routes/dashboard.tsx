import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, FileText, FolderSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell, PageHeader, StatCard } from "@/components/layout/AppShell";
import { InvestigationsTable } from "@/components/investigation/InvestigationsTable";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/States";
import { useInvestigations } from "@/lib/queries";
import { useMode } from "@/lib/mode";
import { demoActivity } from "@/data/demoData";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — VendorLens" },
      { name: "description", content: "Your supplier investigations, reports and items requiring review." },
      { property: "og:title", content: "Overview — VendorLens" },
      { property: "og:description", content: "Supplier investigation dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const mode = useMode();
  const q = useInvestigations();
  const items = q.data ?? [];
  const review = items.filter((i) => i.counts.needs_review + i.counts.contradicted > 0).length;
  const reports = items.filter((i) => i.report_available).length;

  return (
    <AppShell>
      <PageHeader
        title="Welcome back"
        description="Track supplier investigations and the claims that still need your attention."
        actions={<Button asChild><Link to="/investigate"><Plus className="h-4 w-4" /> New Investigation</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          <StatCard key="t" label="Total investigations" value={q.isLoading ? "—" : items.length} icon={<FolderSearch className="h-4 w-4" />} />,
          <StatCard key="r" label="Reports generated" value={q.isLoading ? "—" : reports} icon={<FileText className="h-4 w-4" />} />,
          <StatCard key="v" label="Requiring review" value={q.isLoading ? "—" : review} icon={<AlertTriangle className="h-4 w-4" />} tone={review ? "text-review" : undefined} />,
        ].map((card, i) => (
          <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>{card}</div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="surface-card animate-fade-up p-5" style={{ animationDelay: "200ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent investigations</h2>
            <Link to="/investigations" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {q.isLoading ? (
            <TableSkeleton />
          ) : q.isError ? (
            <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} />
          ) : items.length === 0 ? (
            <EmptyState title="No investigations yet" description="Start by entering a supplier and the claims you want to check." action={<Button asChild size="sm"><Link to="/investigate">New Investigation</Link></Button>} />
          ) : (
            <InvestigationsTable items={items.slice(0, 5)} />
          )}
        </section>

        <div className="space-y-6">
          <section className="surface-card animate-fade-up p-5" style={{ animationDelay: "280ms" }}>
            <h2 className="text-base font-semibold">Recent activity</h2>
            {mode === "demo" ? (
              <ol className="mt-4 space-y-4 border-l pl-4">
                {demoActivity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.at)} · sample</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Activity history is not yet provided by the backend.</p>
            )}
          </section>
          <section className="rounded-lg border bg-accent/50 p-5">
            <h2 className="text-sm font-semibold">How to start</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
              <li>Click <strong className="text-foreground">New Investigation</strong>.</li>
              <li>Enter the supplier name and category.</li>
              <li>List each claim you want checked.</li>
              <li>Review evidence claim by claim.</li>
            </ol>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
