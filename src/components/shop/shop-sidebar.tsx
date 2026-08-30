"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TOGGLES = [
  { key: "new", label: "New Arrival" },
  { key: "best", label: "Best Seller" },
  { key: "sale", label: "On Discount" },
];

function Body({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCat = params.get("category");
  const activeSort = params.get("sort");

  const go = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
    onNavigate?.();
  };

  const catRow = (slug: string | null, label: string) => {
    const active = slug ? activeCat === slug : !activeCat;
    return (
      <button
        key={label}
        onClick={() => go("category", slug)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
          active ? "bg-secondary font-medium text-foreground" : "text-foreground/70 hover:bg-secondary/60",
        )}
      >
        <span
          className={cn(
            "size-3.5 shrink-0 rounded-full border",
            active ? "border-primary bg-primary" : "border-border",
          )}
        />
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 px-2.5 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Category
        </p>
        <div className="flex flex-col gap-0.5">
          {catRow(null, "All Products")}
          {categories.map((c) => catRow(c.slug, c.name))}
        </div>
      </div>
      <div>
        <p className="mb-2 px-2.5 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Filter
        </p>
        <div className="flex flex-col gap-0.5">
          {TOGGLES.map((t) => {
            const active = activeSort === t.key;
            return (
              <button
                key={t.key}
                onClick={() => go("sort", active ? null : t.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  active ? "bg-secondary font-medium text-foreground" : "text-foreground/70 hover:bg-secondary/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {active && "✓"}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ShopSidebar() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
          <Body />
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
            <SlidersHorizontal className="size-4" /> Filters
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <SheetTitle className="px-4 pt-4">Filters</SheetTitle>
            <div className="p-4">
              <Body onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
