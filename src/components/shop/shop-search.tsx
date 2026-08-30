"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function ShopSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    next.delete("page");
    router.push(`/shop?${next.toString()}`, { scroll: false });
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto -mt-8 flex max-w-3xl items-center gap-3 rounded-full border border-border bg-card p-2 pl-5 shadow-[0_18px_50px_-24px_rgba(42,20,55,0.35)]"
    >
      <span className="hidden text-sm font-medium sm:block">Give all you need</span>
      <span className="hidden h-5 w-px bg-border sm:block" />
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Timi's Jewels…"
        className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-foreground px-5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-background transition hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
