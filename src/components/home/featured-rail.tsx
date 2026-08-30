"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FeaturedRail({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <div className="relative min-w-0">
      <div className="mb-3 hidden justify-end gap-2 lg:flex">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => by(-1)}
          className="grid size-9 place-items-center rounded-lg border border-border transition hover:bg-secondary"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => by(1)}
          className="grid size-9 place-items-center rounded-lg bg-foreground text-background transition hover:opacity-90"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>
    </div>
  );
}
