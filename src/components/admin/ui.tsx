import type { ReactNode } from "react";
import { Database, MoreVertical } from "lucide-react";
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
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-6">{children}</div>
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
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-heading text-lg">{title}</h2>
      {action ?? <MoreVertical className="size-4 text-muted-foreground" />}
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
      <p className="mt-2 font-heading text-2xl">{value}</p>
      {(delta !== undefined || hint) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {delta !== undefined && (
            <span className={delta >= 0 ? "text-emerald-600" : "text-rose-deep"}>
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

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
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
        "inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

/* ---- table primitives ---- */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">{children}</table>
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
