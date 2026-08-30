import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "onDark" | "heroDark";

const shell: Record<Variant, string> = {
  // white/lavender resting state → fills purple on hover
  solid: "border-transparent bg-primary/10 text-foreground",
  // outlined resting state → fills purple on hover
  outline: "border-foreground/20 bg-transparent text-foreground",
  // for use over a dark hero → fills white on hover
  onDark:
    "border-white/40 bg-white/10 text-white hover:border-white hover:bg-white hover:text-primary",
  // over a dark hero → fills brand purple on hover / tap, label stays legible
  heroDark:
    "border-white/40 bg-white/10 text-white hover:border-rose hover:bg-primary hover:text-primary-foreground active:border-rose active:bg-primary active:text-primary-foreground",
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

function Inner({ label, variant }: { label: React.ReactNode; variant: Variant }) {
  return (
    <>
      <span className="relative flex items-center gap-2">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[24] motion-reduce:group-hover:scale-100",
            dot[variant],
          )}
        />
        <span className="transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-10 group-hover:opacity-0 motion-reduce:group-hover:translate-x-0">
          {label}
        </span>
      </span>
      <span
        className={cn(
          "absolute inset-0 z-10 flex translate-x-8 items-center justify-center gap-2 opacity-0 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:translate-x-0",
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
  "group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full border px-6 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-[color,background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-0 motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-60";

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
