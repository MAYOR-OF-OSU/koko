"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "onDark" | "heroDark";

// Resting shell + the filled look on hover (desktop) / press (touch).
const shell: Record<Variant, string> = {
  // white/lavender resting state → fills purple on hover
  solid: "border-transparent bg-primary/10 text-foreground",
  // outlined resting state → fills purple on hover
  outline: "border-foreground/20 bg-transparent text-foreground",
  // over a dark hero → fills white
  onDark:
    "border-white/40 bg-white/10 text-white hover:border-white hover:bg-white hover:text-primary data-[pressed]:border-white data-[pressed]:bg-white data-[pressed]:text-primary",
  // over a dark hero → fills brand purple, label stays legible
  heroDark:
    "border-white/40 bg-white/10 text-white hover:border-rose hover:bg-primary hover:text-primary-foreground data-[pressed]:border-rose data-[pressed]:bg-primary data-[pressed]:text-primary-foreground",
};

const dot: Record<Variant, string> = {
  solid: "bg-primary",
  outline: "bg-primary",
  onDark: "bg-white",
  heroDark: "bg-primary",
};

const revealText: Record<Variant, string> = {
  solid: "text-primary-foreground",
  outline: "text-primary-foreground",
  onDark: "text-primary",
  heroDark: "text-primary-foreground",
};

// `hover:` drives desktop; `data-[pressed]` (set from pointer events) drives touch.
const dotMotion =
  "size-2 shrink-0 rounded-full transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[24] group-data-[pressed]:scale-[24] motion-reduce:group-hover:scale-100 motion-reduce:group-data-[pressed]:scale-100";

const labelOut =
  "transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-10 group-hover:opacity-0 group-data-[pressed]:translate-x-10 group-data-[pressed]:opacity-0 motion-reduce:group-hover:translate-x-0 motion-reduce:group-data-[pressed]:translate-x-0";

const labelIn =
  "absolute inset-0 z-10 flex translate-x-8 items-center justify-center gap-2 opacity-0 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-data-[pressed]:translate-x-0 group-data-[pressed]:opacity-100 motion-reduce:translate-x-0";

function Inner({ label, variant }: { label: React.ReactNode; variant: Variant }) {
  return (
    <>
      <span className="relative flex items-center gap-2">
        <span className={cn(dotMotion, dot[variant])} />
        <span className={labelOut}>{label}</span>
      </span>
      <span className={cn(labelIn, revealText[variant])}>
        {label}
        <ArrowRight className="size-4" />
      </span>
    </>
  );
}

const base =
  "group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border px-6 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-[color,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] data-[pressed]:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-0 motion-reduce:data-[pressed]:scale-100 disabled:pointer-events-none disabled:opacity-60";

/**
 * Reliable press state for touch — CSS `:active` on an <a> is flaky in iOS
 * Safari. On touch we hold the filled state briefly after release so the
 * colour change is visible before the page navigates.
 */
function usePressed() {
  const [pressed, setPressed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return {
    "data-pressed": pressed || undefined,
    onPointerDown: () => {
      clearTimeout(timer.current);
      setPressed(true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setPressed(false);
      else timer.current = setTimeout(() => setPressed(false), 180);
    },
    onPointerCancel: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
  } as const;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { variant?: Variant; label?: React.ReactNode }
>(({ variant = "solid", label, children, className, ...props }, ref) => {
  const press = usePressed();
  return (
    <button ref={ref} className={cn(base, shell[variant], className)} {...props} {...press}>
      <Inner label={label ?? children} variant={variant} />
    </button>
  );
});
InteractiveHoverButton.displayName = "InteractiveHoverButton";

export function InteractiveHoverLink({
  href,
  variant = "solid",
  label,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; label?: React.ReactNode }) {
  const press = usePressed();
  return (
    <Link href={href} className={cn(base, shell[variant], className)} {...props} {...press}>
      <Inner label={label ?? children} variant={variant} />
    </Link>
  );
}
