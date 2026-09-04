"use client";

import * as React from "react";
import { ChevronUp } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Floating scroll-to-top button. Appears after ~500px; smooth unless reduce-motion. */
export function BackToTop() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className={cn(
        "fixed right-4 bottom-20 z-40 grid size-11 place-items-center rounded-full border border-border bg-background text-foreground shadow-lg transition-all duration-200 hover:bg-secondary lg:bottom-6",
        show ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ChevronUp className="size-5" />
    </button>
  );
}
