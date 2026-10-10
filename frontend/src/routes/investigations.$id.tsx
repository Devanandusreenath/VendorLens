import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownUp, ArrowLeft, Download, ExternalLink, Lightbulb, RefreshCw, Info, Loader2 } from "lucide-react";
import { AppShell, PageHeader, StatCard } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClaimStatusBadge, EvidenceBadge, InvestigationStatusBadge, SampleTag, CLAIM_STATUS_LABEL } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/States";
import { useInvestigation } from "@/lib/queries";
import { api } from "@/lib/api";
import { formatDate, safeUrl } from "@/lib/format";
import type { ClaimAssessment, ClaimStatus, EvidenceClassification, Investigation } from "@/types";

export const Route = createFileRoute("/investigations/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Investigation ${params.id} — VendorLens` },
      { name: "description", content: "Claim-by-claim supplier evidence report." },
      { property: "og:title", content: `Investigation ${params.id} — VendorLens` },
      { property: "og:description", content: "Claim-by-claim supplier evidence report." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { id } = Route.useParams();
  const q = useInvestigation(id);
  return (
    <AppShell>
      <Link to="/investigations" className="no-print mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All investigations
      </Link>
      {q.isLoading ? (
        <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><div className="grid gap-4 sm:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div><Skeleton className="h-64" /></div>
      ) : q.isError || !q.data ? (
        <ErrorState message={(q.error as Error)?.message ?? "Investigation not found."} onRetry={() => q.refetch()} />
      ) : (
        <Report inv={q.data} />
      )}
    </AppShell>
  );
}

function Report({ inv }: { inv: Investigation }) {
  const [open, setOpen] = useState<ClaimAssessment | null>(null);
  const [rerunning, setRerunning] = useState(false);
  const counts = useMemo(() => {
    const c: Record<ClaimStatus, number> = { verified: 0, contradicted: 0, unverified: 0, needs_review: 0 };
    inv.claims.forEach((x) => c[x.status]++);
    return c;
  }, [inv]);
  const sample = inv.origin === "sample";

  const rerun = async () => {
    setRerunning(true);
    try {
      const { id } = await api.createInvestigation({
        supplier_name: inv.supplier.name,
        website: inv.supplier.website ?? "",
        category: inv.supplier.category,
        region: inv.supplier.region ?? "",
        description: inv.supplier.description ?? "",
        claims: inv.claims.map((c) => c.claim),
        additional_context: inv.additional_context ?? "",
      });
      toast.success("Re-run submitted", { description: `New investigation ${id}` });
    } catch (e) {
      toast.error("Re-run failed", { description: (e as Error).message });
    } finally {
      setRerunning(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={<div className="flex items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{inv.id}</span><InvestigationStatusBadge status={inv.status} />{sample && <SampleTag />}</div>}
        title={inv.supplier.name}
        description={<>Created {formatDate(inv.created_at, true)} · {inv.supplier.category}{inv.supplier.region ? ` · ${inv.supplier.region}` : ""}</>}
        actions={
          <>
            <Button variant="outline" onClick={rerun} disabled={sample || rerunning} title={sample ? "Unavailable in Demo Mode" : undefined}>
              {rerunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {sample ? "Re-run (needs backend)" : "Re-run investigation"}
            </Button>
            <Button onClick={() => window.print()}><Download className="h-4 w-4" /> Export report</Button>
          </>
        }
      />

      {sample && (
        <div className="mb-6 rounded-lg border border-demo/25 bg-demo-soft p-4 text-sm text-foreground">
          <strong>Sample report.</strong> This is illustrative data for previewing the interface. No live search was performed and the supplier and sources are fictional.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Claims assessed" value={inv.claims.length} />
        <StatCard label="Verified" value={counts.verified} tone="text-verified" />
        <StatCard label="Contradicted" value={counts.contradicted} tone="text-contradicted" />
        <StatCard label="Unverified" value={counts.unverified} tone="text-unverified" />
        <StatCard label="Needs review" value={counts.needs_review} tone="text-review" />
      </div>

      <ReportSection n={1} title="Executive summary">
        <p className="text-sm leading-relaxed">{inv.summary.overview ?? "No summary was provided."}</p>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          <BulletList title="Key findings" items={inv.summary.key_findings} empty="No key findings recorded." />
          <BulletList title="Unresolved questions" items={inv.summary.unresolved_questions} empty="None recorded." />
          <BulletList title="Evidence limitations" items={inv.summary.limitations} empty="None recorded." />
        </div>
      </ReportSection>

      <ReportSection n={2} title="Claim verification matrix">
        <ClaimMatrix claims={inv.claims} onOpen={setOpen} />
      </ReportSection>

      <ReportSection n={3} title="Supplier information">
        {inv.supplier.facts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public company information was returned. Missing information is not evidence of wrongdoing.</p>
        ) : (
          <dl className="divide-y rounded-md border">
            {inv.supplier.facts.map((f) => (
              <div key={f.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr_auto] sm:items-center">
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="text-sm">{f.value ?? <span className="text-muted-foreground">Unavailable</span>}{f.source && <span className="block text-xs text-muted-foreground">{f.source}</span>}</dd>
                <dd><span className={f.kind === "fact" ? "rounded bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground" : "rounded bg-review-soft px-1.5 py-0.5 text-[11px] font-medium text-review"}>{f.kind === "fact" ? "Sourced fact" : "Inference"}</span></dd>
              </div>
            ))}
          </dl>
        )}
      </ReportSection>

      <ReportSection n={4} title="Recommended next steps">
        {inv.next_steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations yet.</p>
        ) : (
          <>
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5" /> Suggestions for follow-up — not verified facts.</p>
            <ul className="space-y-2">
              {inv.next_steps.map((s) => (
                <li key={s} className="flex gap-2.5 text-sm"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{s}</li>
              ))}
            </ul>
          </>
        )}
      </ReportSection>

      <EvidenceSheet claim={open} sample={sample} onClose={() => setOpen(null)} />
    </>
  );
}

function ReportSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card mt-6 p-6">
      <h2 className="mb-4 flex items-baseline gap-3 text-lg font-semibold text-navy"><span className="font-mono text-xs text-muted-foreground">§{n}</span>{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {items.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">{empty}</p> : (
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      )}
    </div>
  );
}

type SortKey = "claim" | "status" | "sources" | "checked";
const STATUS_ORDER: Record<ClaimStatus, number> = { contradicted: 0, needs_review: 1, unverified: 2, verified: 3 };

function ClaimMatrix({ claims, onOpen }: { claims: ClaimAssessment[]; onOpen: (c: ClaimAssessment) => void }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "status", dir: 1 });
  const showConfidence = claims.some((c) => c.confidence);
  const sorted = [...claims].sort((a, b) => {
    const v = (c: ClaimAssessment) =>
      sort.key === "claim" ? c.claim : sort.key === "status" ? STATUS_ORDER[c.status] : sort.key === "sources" ? c.evidence.length : c.last_checked ?? "";
    const x = v(a), y = v(b);
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
  });
  const H = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="px-3 py-2.5 font-medium" aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label}<ArrowDownUp className="h-3 w-3" />
      </button>
    </th>
  );
  if (claims.length === 0) return <p className="text-sm text-muted-foreground">No claims were assessed.</p>;
  return (
    <div className="-mx-6 overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-y bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="w-0 pl-6" />
            <H k="claim" label="Claim" />
            <H k="status" label="Status" />
            <th className="px-3 py-2.5 font-medium">Evidence summary</th>
            <H k="sources" label="Sources" />
            {showConfidence && <th className="px-3 py-2.5 font-medium">Evidence strength</th>}
            <H k="checked" label="Last checked" />
            <th className="pr-6" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((c) => (
            <tr key={c.id} className="align-top hover:bg-muted/40">
              <td className="pl-6" />
              <td className="px-3 py-3 font-medium">{c.claim}</td>
              <td className="px-3 py-3"><ClaimStatusBadge status={c.status} /></td>
              <td className="max-w-xs px-3 py-3 text-muted-foreground">{c.summary ?? "—"}</td>
              <td className="px-3 py-3 font-mono">{c.evidence.length}</td>
              {showConfidence && <td className="px-3 py-3" title={c.confidence?.methodology}>{c.confidence?.label ?? "—"}</td>}
              <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{formatDate(c.last_checked)}</td>
              <td className="pr-6 py-2 text-right">
                <Button variant="outline" size="sm" onClick={() => onOpen(c)}>View evidence</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const GROUPS: { k: EvidenceClassification; title: string }[] = [
  { k: "supporting", title: "Supporting evidence" },
  { k: "contradicting", title: "Contradicting evidence" },
  { k: "neutral", title: "Neutral or contextual sources" },
];

function EvidenceSheet({ claim, sample, onClose }: { claim: ClaimAssessment | null; sample: boolean; onClose: () => void }) {
  return (
    <Sheet open={!!claim} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {claim && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2"><ClaimStatusBadge status={claim.status} />{sample && <SampleTag />}</div>
              <SheetTitle className="text-left font-display text-lg">{claim.claim}</SheetTitle>
              <SheetDescription className="text-left">{claim.summary ?? `Status: ${CLAIM_STATUS_LABEL[claim.status]}`}</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-7 px-4 pb-8">
              {claim.evidence.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No evidence records were found for this claim. This means the claim could not be checked — it is not evidence that the claim is false.</p>
              )}
              {GROUPS.map((g) => {
                const items = claim.evidence.filter((e) => e.classification === g.k);
                if (!items.length) return null;
                return (
                  <div key={g.k}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title} ({items.length})</h3>
                    <ul className="space-y-3">
                      {items.map((e) => {
                        const url = safeUrl(e.url);
                        return (
                          <li key={e.id} className="rounded-md border p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium leading-snug">{e.title}</p>
                                <p className="font-mono text-xs text-muted-foreground">{e.domain ?? "Unknown domain"}</p>
                              </div>
                              <EvidenceBadge kind={e.classification} />
                            </div>
                            {e.snippet ? <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground">“{e.snippet}”</blockquote> : <p className="mt-3 text-sm italic text-muted-foreground">No excerpt available.</p>}
                            {e.relevance && <p className="mt-2 text-xs"><span className="text-muted-foreground">Relevance:</span> {e.relevance}</p>}
                            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <div><dt className="text-muted-foreground">Source published</dt><dd>{formatDate(e.published_at)}</dd></div>
                              <div><dt className="text-muted-foreground">Event date</dt><dd>{formatDate(e.event_date)}</dd></div>
                              <div><dt className="text-muted-foreground">Retrieved</dt><dd>{formatDate(e.retrieved_at)}</dd></div>
                            </dl>
                            <div className="mt-3">
                              {url ? (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={url} target="_blank" rel="noopener noreferrer nofollow">Open original source <ExternalLink className="h-3.5 w-3.5" /></a>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">{sample ? "Sample source — no real link." : "No source URL provided."}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">“Source published” is when the page was published; “Event date” is when the underlying event (e.g. certificate issue) occurred, if stated.</p>
              {claim.limitations.length > 0 && (
                <div className="rounded-md bg-review-soft p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-review">Limitations</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">{claim.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
