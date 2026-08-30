import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "onDark";

const shell: Record<Variant, string> = {
  // white/lavender resting state → fills purple on hover
  solid: "border-transparent bg-primary/10 text-foreground",
  // outlined resting state → fills purple on hover
  outline: "border-foreground/20 bg-transparent text-foreground",
  // for use over a dark hero → fills white on hover
  onDark: "border-white/40 bg-white/10 text-white",
};

const dot: Record<Variant, string> = {
  solid: "bg-primary",
  outline: "bg-primary",
  onDark: "bg-white",
};

const revealText: Record<Variant, string> = {
  solid: "text-primary-foreground",
  outline: "text-primary-foreground",
  onDark: "text-primary",
};

function Inner({ label, variant }: { label: React.ReactNode; variant: Variant }) {
  return (
    <>
      <span className="relative flex items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full transition-transform duration-500 group-hover:scale-[24]",
            dot[variant],
          )}
        />
        <span className="transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {label}
        </span>
      </span>
      <span
        className={cn(
          "absolute inset-0 z-10 flex translate-x-8 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
          revealText[variant],
        )}
      >
        {label}
        <ArrowRight className="size-4" />
      </span>
    </>
  );
}

const base =
  "group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border px-6 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-60";

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { variant?: Variant; label?: React.ReactNode }
>(({ variant = "solid", label, children, className, ...props }, ref) => (
  <button ref={ref} className={cn(base, shell[variant], className)} {...props}>
    <Inner label={label ?? children} variant={variant} />
  </button>
));
InteractiveHoverButton.displayName = "InteractiveHoverButton";

export function InteractiveHoverLink({
  href,
  variant = "solid",
  label,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; label?: React.ReactNode }) {
  return (
    <Link href={href} className={cn(base, shell[variant], className)} {...props}>
      <Inner label={label ?? children} variant={variant} />
    </Link>
  );
}
