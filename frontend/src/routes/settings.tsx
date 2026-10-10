import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RotateCw, XCircle } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setMode, useMode } from "@/lib/mode";
import { useHealth } from "@/lib/queries";
import { API_BASE_URL, APP_VERSION } from "@/lib/config";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VendorLens" },
      { name: "description", content: "Backend connectivity, demo mode and application preferences." },
      { property: "og:title", content: "Settings — VendorLens" },
      { property: "og:description", content: "VendorLens application settings." },
    ],
  }),
  component: SettingsPage,
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const mode = useMode();
  const qc = useQueryClient();
  const health = useHealth();

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">PA</div>
            <div>
              <p className="font-medium">Preview Account</p>
              <p className="text-sm text-muted-foreground">Authentication is not implemented in this preview.</p>
            </div>
          </div>
        </Card>

        <Card title="Demo Mode">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="demo">Use sample data</Label>
              <p className="mt-1 text-sm text-muted-foreground">Shows clearly labelled, fictional sample investigations. No live searches are run.</p>
            </div>
            <Switch
              id="demo"
              checked={mode === "demo"}
              onCheckedChange={(c) => {
                setMode(c ? "demo" : "live");
                qc.invalidateQueries();
                toast.success(c ? "Demo Mode on" : "Live backend mode on");
              }}
            />
          </div>
        </Card>

        <Card title="Backend connectivity">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">API base URL</dt><dd className="truncate font-mono text-xs">{API_BASE_URL || "Not configured"}</dd></div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Health check</dt>
              <dd className="flex items-center gap-1.5">
                {health.isFetching ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : health.isSuccess ? <><CheckCircle2 className="h-4 w-4 text-verified" /> Connected</> : <><XCircle className="h-4 w-4 text-contradicted" /> Unavailable</>}
              </dd>
            </div>
            {health.isError && <p className="text-xs text-muted-foreground">{(health.error as Error).message}</p>}
          </dl>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => health.refetch()}><RotateCw className="h-4 w-4" /> Check again</Button>
        </Card>

        <Card title="About this build">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Version</dt><dd className="font-mono text-xs">{APP_VERSION}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Current mode</dt><dd>{mode === "demo" ? "Demo — sample data" : "Live backend"}</dd></div>
          </dl>
        </Card>
      </div>
    </AppShell>
  );
}
