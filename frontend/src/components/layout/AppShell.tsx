import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, FileText, FolderSearch, LayoutDashboard, Menu, PlusCircle, Settings, X, FlaskConical, Radio } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useMode } from "@/lib/mode";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/investigate", label: "New Investigation", icon: PlusCircle },
  { to: "/investigations", label: "Investigations", icon: FolderSearch },
  { to: "/compare", label: "Vendor Comparison", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function ModeBanner() {
  const mode = useMode();
  if (mode !== "demo") return null;
  return (
    <div className="no-print flex items-center justify-center gap-2 border-b border-demo/25 bg-demo-soft px-4 py-1.5 text-center text-xs font-medium text-demo">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      Demo Mode — Sample Data. Nothing shown here comes from a live search.
      <Link to="/settings" className="underline underline-offset-2">Change</Link>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const mode = useMode();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5">
        <Logo to="/dashboard" />
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground" }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 text-xs">
          {mode === "demo" ? (
            <><FlaskConical className="h-3.5 w-3.5 text-demo" /> <span className="text-muted-foreground">Demo Mode</span></>
          ) : (
            <><Radio className="h-3.5 w-3.5 text-verified" /> <span className="text-muted-foreground">Live backend mode</span></>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">PA</div>
          <div className="leading-tight">
            <p className="text-sm font-medium">Preview Account</p>
            <p className="text-xs text-muted-foreground">No sign-in implemented</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <ModeBanner />
      <div className="flex">
        <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <SidebarNav />
        </aside>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 border-r bg-sidebar shadow-xl">
              <button className="absolute right-3 top-4 rounded p-1 hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <SidebarNav onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <header className="no-print flex h-14 items-center gap-3 border-b bg-surface px-4 lg:hidden">
            <button onClick={() => setOpen(true)} className="rounded p-1.5 hover:bg-muted" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo to="/dashboard" />
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold text-navy sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className={cn("no-print flex flex-wrap gap-2")}>{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, tone }: { label: string; value: ReactNode; icon?: ReactNode; tone?: string | undefined }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon && <span className={cn("text-muted-foreground", tone)}>{icon}</span>}
      </div>
      <p className={cn("mt-2 font-display text-2xl font-semibold text-navy", tone)}>{value}</p>
    </div>
  );
}
