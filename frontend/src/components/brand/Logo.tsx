import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <path d="M16 2.5 4.5 7v8.2c0 7 4.9 12.4 11.5 14.3 6.6-1.9 11.5-7.3 11.5-14.3V7L16 2.5Z" className="fill-navy" />
      <circle cx="15" cy="14.5" r="5.2" fill="none" strokeWidth="2.2" className="stroke-navy-foreground" />
      <path d="m12.7 14.6 1.6 1.6 3.2-3.3" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="stroke-navy-foreground" />
      <path d="m19 18.6 3.4 3.4" strokeWidth="2.4" strokeLinecap="round" className="stroke-primary" />
    </svg>
  );
}

export function Logo({ to = "/", className }: { to?: "/" | "/dashboard"; className?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2", className)} aria-label="VendorLens home">
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight text-navy">VendorLens</span>
    </Link>
  );
}
