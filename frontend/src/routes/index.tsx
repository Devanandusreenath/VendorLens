import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, Globe2, Scale, ShieldCheck, Tags, Link2, FileDown, ClipboardList, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ClaimStatusBadge, SampleTag } from "@/components/shared/StatusBadge";
import { Reveal } from "@/components/shared/Reveal";
import type { ClaimStatus } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VendorLens — Know Your Supplier Before You Commit" },
      { name: "description", content: "Investigate supplier claims, uncover public evidence, compare alternatives and buy with confidence." },
      { property: "og:title", content: "VendorLens — Know Your Supplier Before You Commit" },
      { property: "og:description", content: "Evidence-backed supplier due diligence for purchasing teams." },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { t: "Describe the supplier", d: "Enter a supplier and the specific claims you want to check." },
  { t: "Collect public evidence", d: "Public sources are searched and relevant evidence is collected." },
  { t: "Review the findings", d: "See supporting evidence, conflicts, and missing information per claim." },
  { t: "Share the report", d: "Produce a supplier intelligence report for your decision record." },
];

const FEATURES = [
  { i: ShieldCheck, t: "Supplier claim verification", d: "Each claim is assessed separately as verified, contradicted, unverified or needs review." },
  { i: Globe2, t: "Live web evidence discovery", d: "Evidence is gathered from public web sources by the VendorLens backend." },
  { i: Tags, t: "Product and price research", d: "Locate public product specifications and pricing references where they exist." },
  { i: Link2, t: "Evidence traceability", d: "Every finding links to its source, with publication and retrieval dates." },
  { i: Scale, t: "Supplier comparison", d: "Compare two or three suppliers side by side, with gaps highlighted." },
  { i: FileDown, t: "Intelligence reports", d: "Export a structured report to share with procurement and finance." },
];

const PREVIEW: { c: string; s: ClaimStatus; n: number }[] = [
  { c: "Holds ISO 9001:2015 certification", s: "verified", n: 2 },
  { c: "Authorised distributor for named brand", s: "contradicted", n: 1 },
  { c: "Products meet A4-80 steel grade", s: "needs_review", n: 2 },
  { c: "Delivers within 10 business days", s: "unverified", n: 0 },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Site">
            <a href="#product" className="hover:text-foreground">Product</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/dashboard">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/investigate">Start investigation</Link>
            </Button>
          </div>
        </div>
      </header>

      <section id="product" className="grid-backdrop border-b">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-accent-foreground">
              <FileSearch className="h-3.5 w-3.5" /> Supplier due diligence
            </p>
            <h1 className="mt-5 animate-fade-up text-4xl font-semibold leading-[1.08] text-navy sm:text-5xl lg:text-[56px]" style={{ animationDelay: "80ms" }}>
              Know Your Supplier Before You Commit.
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
              Investigate supplier claims, uncover supporting evidence, compare alternatives, and make purchasing decisions with confidence.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Button size="lg" asChild className="transition-transform hover:-translate-y-0.5">
                <Link to="/investigate">Investigate a Supplier <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="surface-card animate-scale-in overflow-hidden shadow-[var(--shadow-elevated)]" style={{ animationDelay: "200ms" }} aria-label="Product preview with sample data">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-navy">Northbridge Fasteners</p>
                <p className="font-mono text-[11px] text-muted-foreground">SAMPLE-1042 · Claim matrix</p>
              </div>
              <SampleTag />
            </div>
            <ul className="divide-y">
              {PREVIEW.map((r, i) => (
                <li key={r.c} className="flex animate-fade-in items-center justify-between gap-3 px-5 py-3.5" style={{ animationDelay: `${400 + i * 120}ms` }}>
                  <span className="text-sm">{r.c}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:inline">{r.n} sources</span>
                    <ClaimStatusBadge status={r.s} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t bg-muted/60 px-5 py-3 text-xs text-muted-foreground">
              Illustrative sample. Missing evidence is shown as “Unverified”, never as wrongdoing.
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold text-navy">How it works</h2>
        </Reveal>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 100} className="bg-surface p-6 transition-colors hover:bg-accent/40">
              <span className="font-mono text-xs text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="features" className="border-y bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold text-navy">Built for evidence, not guesswork</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ i: Icon, t, d }, i) => (
              <Reveal key={t} delay={(i % 3) * 100}>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground transition-transform hover:scale-110">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="grid gap-8 rounded-lg bg-navy p-8 text-navy-foreground sm:p-12 lg:grid-cols-[auto_1fr]">
          <Info className="h-8 w-8 animate-pulse-soft opacity-80" />
          <div>
            <h2 className="text-2xl font-semibold">A decision-support tool, not a verdict</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed opacity-85">
              VendorLens supports human decision-making. It does not guarantee that a supplier is legitimate, and the absence of evidence is
              never treated as proof of wrongdoing. Findings depend on the quality, availability and recency of public information, so
              important decisions should always include direct verification with the supplier and relevant authorities.
            </p>
            <Button variant="secondary" className="mt-6" asChild>
              <Link to="/investigate"><ClipboardList className="h-4 w-4" /> Start an investigation</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} VendorLens</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground" aria-label="Footer">
            <Link to="/info/$slug" params={{ slug: "about" }} className="hover:text-foreground">About</Link>
            <a href="#product" className="hover:text-foreground">Product</a>
            <Link to="/info/$slug" params={{ slug: "privacy" }} className="hover:text-foreground">Privacy</Link>
            <Link to="/info/$slug" params={{ slug: "terms" }} className="hover:text-foreground">Terms</Link>
            <Link to="/info/$slug" params={{ slug: "contact" }} className="hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
