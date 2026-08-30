import { cn } from "@/lib/utils";

type Variant = "lockup" | "monogram" | "wordmark";

/**
 * Timi's Jewels identity. Drawn with `currentColor` so it takes on whatever
 * text colour it sits in. `tone="metal"` renders it in gold.
 */
export function Logo({
  variant = "lockup",
  tone = "current",
  className,
  title = "Timi's Jewels",
}: {
  variant?: Variant;
  tone?: "current" | "metal";
  className?: string;
  title?: string;
}) {
  const color = tone === "metal" ? "var(--accent-gold)" : "currentColor";

  if (variant === "monogram") {
    return (
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label={title}
        className={cn("h-8 w-8", className)}
        style={{ color }}
      >
        <Monogram />
      </svg>
    );
  }

  if (variant === "wordmark") {
    return (
      <svg
        viewBox="0 0 280 40"
        role="img"
        aria-label={title}
        className={cn("h-6 w-auto", className)}
        style={{ color }}
      >
        <Wordmark />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 44"
      role="img"
      aria-label={title}
      className={cn("h-8 w-auto", className)}
      style={{ color }}
    >
      <g transform="translate(0,0) scale(0.9)">
        <Monogram />
      </g>
      <g transform="translate(52, 2)">
        <Wordmark />
      </g>
    </svg>
  );
}

function Monogram() {
  return (
    <g fill="none" stroke="currentColor">
      <rect x="1.5" y="1.5" width="45" height="45" rx="8" strokeWidth="2" />
      <path d="M12 15 H27 M19.5 15 V34" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M33 15 V29 a6 6 0 0 1 -12 0" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M33 10.5 l2.2 2.2 -2.2 2.2 -2.2 -2.2 z" fill="currentColor" stroke="none" />
    </g>
  );
}

function Wordmark() {
  return (
    <text
      x="0"
      y="29"
      fill="currentColor"
      style={{
        fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
        fontWeight: 500,
        fontSize: "27px",
        letterSpacing: "0em",
      }}
    >
      Timi&rsquo;s Jewels
    </text>
  );
}
