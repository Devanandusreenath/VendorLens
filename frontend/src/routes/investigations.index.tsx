import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { InvestigationsTable } from "@/components/investigation/InvestigationsTable";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvestigations } from "@/lib/queries";

export const Route = createFileRoute("/investigations/")({
  head: () => ({
    meta: [
      { title: "Investigations — VendorLens" },
      { name: "description", content: "Search and filter your supplier investigations." },
      { property: "og:title", content: "Investigations — VendorLens" },
      { property: "og:description", content: "Supplier investigation history." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const q = useInvestigations();
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");

  const filtered = useMemo(() => {
    const now = Date.now();
    return (q.data ?? []).filter((i) => {
      if (term && !`${i.supplier_name} ${i.id} ${i.category}`.toLowerCase().includes(term.toLowerCase())) return false;
      if (status === "attention" && i.counts.contradicted + i.counts.needs_review === 0) return false;
      if (status !== "all" && status !== "attention" && i.status !== status) return false;
      if (range !== "all") {
        const t = new Date(i.created_at).getTime();
        if (Number.isNaN(t) || now - t > Number(range) * 86400000) return false;
      }
      return true;
    });
  }, [q.data, term, status, range]);

  return (
    <AppShell>
      <PageHeader title="Investigations" description="Every supplier investigation, with its claim status summary." actions={<Button asChild><Link to="/investigate"><Plus className="h-4 w-4" /> New Investigation</Link></Button>} />
      <section className="surface-card p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search supplier, ID or category" className="pl-9" aria-label="Search investigations" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-48" aria-label="Status filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="attention">Needs attention</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="not_run">Not run (demo)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="sm:w-40" aria-label="Date filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any date</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {q.isLoading ? <TableSkeleton rows={5} /> : q.isError ? (
          <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} />
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState title="No investigations yet" description="Investigations you start will appear here." action={<Button asChild size="sm"><Link to="/investigate">Start one</Link></Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matches" description="Try a different search term or clear the filters." action={<Button size="sm" variant="outline" onClick={() => { setTerm(""); setStatus("all"); setRange("all"); }}>Clear filters</Button>} />
        ) : (
          <InvestigationsTable items={filtered} />
        )}
      </section>
    </AppShell>
  );
}
