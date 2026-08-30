import Link from "next/link";
import { cn } from "@/lib/utils";

export function ShopPagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (p: number) => string;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5 text-sm">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "rounded-lg px-3 py-1.5 transition hover:bg-secondary",
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        ← Previous
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={cn(
            "grid size-8 place-items-center rounded-lg transition",
            p === page ? "bg-foreground text-background" : "hover:bg-secondary",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={makeHref(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={cn(
          "rounded-lg px-3 py-1.5 transition hover:bg-secondary",
          page === pageCount && "pointer-events-none opacity-40",
        )}
      >
        Next →
      </Link>
    </nav>
  );
}
