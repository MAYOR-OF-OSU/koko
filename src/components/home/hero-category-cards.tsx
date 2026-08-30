"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { categories } from "@/lib/mock-data";

export function HeroCategoryCards() {
  const railRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="relative z-20 mx-auto -mt-28 max-w-[100rem] min-w-0 px-4 sm:-mt-32 sm:px-8">
      <div
        ref={railRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="group w-[19rem] shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-[0_24px_60px_-24px_rgba(42,20,55,0.45)] ring-1 ring-border"
          >
            <div className="p-4 pb-2">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                Categories
              </p>
              <p className="font-heading text-xl">{c.name}</p>
            </div>
            <div className="relative mx-4 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="19rem"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-background">
                Check More Product <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll categories"
        onClick={() => railRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
        className="absolute right-2 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background shadow-lg sm:grid"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
