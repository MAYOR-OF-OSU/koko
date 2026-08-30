"use client";

import * as React from "react";
import { BellRing, Check } from "lucide-react";
import { saveStock, raiseStockAlert } from "@/server/actions/stock";
import { useAction, inputClass } from "@/components/admin/form";
import { Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type StockRow = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  stock: number;
};

function StockCell({ row, canEdit }: { row: StockRow; canEdit: boolean }) {
  const [value, setValue] = React.useState(String(row.stock));
  const { pending, run } = useAction(
    (n: number) => saveStock(row.variantId, n),
    { success: "Stock saved" },
  );

  if (!canEdit) return <span className="tabular-nums">{row.stock}</span>;

  const dirty = value.trim() !== String(row.stock);
  return (
    <span className="inline-flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        className={cn(inputClass, "w-20 py-1.5 text-sm")}
      />
      {dirty && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(Math.max(0, Math.round(Number(value) || 0)))}
          className="grid size-7 place-items-center rounded-md bg-foreground text-background disabled:opacity-50"
          aria-label="Save stock"
        >
          <Check className="size-3.5" />
        </button>
      )}
    </span>
  );
}

function NotifyButton({ row }: { row: StockRow }) {
  const [done, setDone] = React.useState(false);
  const { pending, run } = useAction(
    () => raiseStockAlert({ productId: row.productId, variantId: row.variantId }),
    { success: "Admin notified", onDone: () => setDone(true) },
  );
  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() => run()}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground disabled:opacity-50"
    >
      <BellRing className="size-3" />
      {done ? "Sent" : "Notify admin"}
    </button>
  );
}

export function StockTable({
  rows,
  threshold,
  canEdit,
}: {
  rows: StockRow[];
  threshold: number;
  canEdit: boolean;
}) {
  const [onlyLow, setOnlyLow] = React.useState(false);
  const shown = onlyLow ? rows.filter((r) => r.stock <= threshold) : rows;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
        Low stock only (≤ {threshold})
      </label>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          Nothing to show.
        </p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Variant</TH>
              <TH>On hand</TH>
              <TH className="text-right">Alert</TH>
            </TR>
          </THead>
          <tbody>
            {shown.map((r) => {
              const low = r.stock <= threshold;
              return (
                <TR key={r.variantId}>
                  <TD className="font-medium">{r.productName}</TD>
                  <TD className="text-muted-foreground">{r.variantName}</TD>
                  <TD>
                    <span className="inline-flex items-center gap-2">
                      <StockCell row={r} canEdit={canEdit} />
                      {low && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.62rem] font-medium text-rose-800">
                          {r.stock === 0 ? "Out" : "Low"}
                        </span>
                      )}
                    </span>
                  </TD>
                  <TD className="text-right">{low ? <NotifyButton row={r} /> : null}</TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
