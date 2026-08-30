"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-in reveal that degrades safely: content is visible by default. JS only
 * *hides then animates* elements that are below the fold on mount, so a failed
 * or blocked script can never leave a blank section.
 */
type RevealProps = {
  group?: boolean;
  className?: string;
  children?: ReactNode;
  id?: string;
};

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only opt in for elements that start below the viewport.
    if (el.getBoundingClientRect().top < window.innerHeight - 40) return;

    el.dataset.pending = "";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            delete el.dataset.pending;
            el.dataset.shown = "";
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

export function Reveal({ group, className, children, id }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} id={id} data-reveal className={cn(group && "reveal-group", className)}>
      {children}
    </div>
  );
}

export function RevealItem({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={className}>{children}</div>;
}
