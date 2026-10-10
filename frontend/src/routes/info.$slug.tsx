import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const PAGES: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About VendorLens",
    body: [
      "VendorLens is a supplier due-diligence tool that helps purchasing teams check what suppliers claim against publicly available evidence.",
      "It is designed to support human judgement. It does not certify suppliers or guarantee their legitimacy.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "This preview stores your mode preference and any Demo Mode drafts only in your own browser.",
      "When connected to a backend, investigation details you submit are sent to that backend for processing. A full privacy policy will be published before general availability.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "VendorLens findings are informational and depend on the quality, availability and recency of public evidence.",
      "Findings are not legal, financial or compliance advice. Verify important information directly with suppliers and relevant authorities.",
    ],
  },
  contact: {
    title: "Contact",
    body: ["Contact details will be published with the production release. This is a hackathon preview."],
  },
};

export const Route = createFileRoute("/info/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — VendorLens` },
          { name: "description", content: loaderData.body[0] },
          { property: "og:title", content: `${loaderData.title} — VendorLens` },
          { property: "og:description", content: loaderData.body[0] },
        ]
      : [{ title: "Not found — VendorLens" }, { name: "robots", content: "noindex" }],
  }),
  component: InfoPage,
});

function InfoPage() {
  const page = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4"><Logo /></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-navy">{page.title}</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          {page.body.map((p) => <p key={p}>{p}</p>)}
        </div>
      </main>
    </div>
  );
}
