"use client";

import { Check } from "@/components/ui/icon";
import { resolveStockAlert } from "@/server/actions/stock";
import { useAction } from "@/components/admin/form";
import { timeAgo } from "@/lib/format";

export type AlertItem = {
  id: string;
  productName: string;
  variantName: string | null;
  stock: number;
  note: string | null;
  raisedBy: string | null;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
};

function ResolveButton({ id }: { id: string }) {
  const { pending, run } = useAction(() => resolveStockAlert(id), { success: "Alert resolved" });
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run()}
      className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[0.7rem] font-medium text-background disabled:opacity-50"
    >
      <Check className="size-3" /> Resolve
    </button>
  );
}

function Row({ a, canResolve }: { a: AlertItem; canResolve: boolean }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {a.productName}
          {a.variantName ? ` — ${a.variantName}` : ""}{" "}
          <span
            className={
              a.stock === 0
                ? "rounded-full bg-rose-100 px-2 py-0.5 text-[0.62rem] font-medium text-rose-800"
                : "rounded-full bg-amber-100 px-2 py-0.5 text-[0.62rem] font-medium text-amber-800"
            }
          >
            {a.stock} left
          </span>
        </p>
        {a.note && <p className="mt-1 text-sm text-muted-foreground">“{a.note}”</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          {a.raisedBy ? `Raised by ${a.raisedBy} · ` : ""}
          {timeAgo(a.createdAt)}
          {a.status === "resolved" && a.resolvedAt ? ` · resolved ${timeAgo(a.resolvedAt)}` : ""}
        </p>
      </div>
      {a.status === "open" && canResolve && <ResolveButton id={a.id} />}
    </li>
  );
}

export function AlertsList({
  open,
  resolved,
  canResolve,
}: {
  open: AlertItem[];
  resolved: AlertItem[];
  canResolve: boolean;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-heading text-lg">Open ({open.length})</h2>
        {open.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            No open alerts. 🎉
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((a) => (
              <Row key={a.id} a={a} canResolve={canResolve} />
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-lg text-muted-foreground">Resolved</h2>
          <ul className="space-y-3 opacity-70">
            {resolved.map((a) => (
              <Row key={a.id} a={a} canResolve={false} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
