import type { ReactNode } from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/admin/mini-chart";

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 sm:items-end sm:pb-5">
        <div className="min-w-0">
          <h1 className="font-heading text-xl text-balance sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-5 sm:mt-6">{children}</div>
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

export function CardHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
      <h2 className="font-heading text-lg">{title}</h2>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  spark,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  spark?: number[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl tabular-nums">{value}</p>
      {(delta !== undefined || hint) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {delta !== undefined && (
            <span className={cn("font-medium", delta >= 0 ? "text-emerald-600" : "text-rose-deep")}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
            </span>
          )}{" "}
          {hint}
        </p>
      )}
      {spark && spark.length > 1 && (
        <div className="mt-3">
          <Sparkline data={spark} up={(delta ?? 0) >= 0} />
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-center sm:py-14">
      <div className="mx-auto max-w-sm">
        {icon && (
          <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <p className="text-balance font-heading text-base">{title}</p>
        {hint && <p className="mt-1 text-pretty text-sm text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function DbDown({ area = "This area" }: { area?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-5 text-sm text-amber-900">
      <Database className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Database not reachable</p>
        <p className="mt-1 text-amber-800">
          {area} needs the database. Start it with{" "}
          <code className="rounded bg-amber-100 px-1">pnpm db:up &amp;&amp; pnpm db:push &amp;&amp; pnpm db:seed</code>, then reload.
        </p>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  published: "bg-emerald-100 text-emerald-800",
  paid: "bg-emerald-100 text-emerald-800",
  fulfilled: "bg-sky-100 text-sky-800",
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800",
  archived: "bg-muted text-muted-foreground",
  cancelled: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-1.5 py-0.5 text-[0.68rem] font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

/* ---- table primitives ---- */
/** `bare` drops the wrapper's own border/bg — use it when the table already sits
 *  inside a <Panel> so you don't get a box-in-a-box. */
export function Table({ children, bare }: { children: ReactNode; bare?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-x-auto",
        bare
          ? "-mx-5 border-t border-border sm:-mx-6"
          : "rounded-lg border border-border bg-card",
      )}
    >
      <table className="w-full min-w-[34rem] text-sm tabular-nums [&_tbody_tr]:transition-colors">
        {children}
      </table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
      {children}
    </thead>
  );
}
export function TH({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}
export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border last:border-0", className)}>{children}</tr>;
}
export function TD({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
