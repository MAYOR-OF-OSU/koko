import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while an /admin/* page's server render is in flight. Deliberately
 * layout-agnostic — a header plus a few blocks — so it reads as "loading" on
 * the table, form and chart pages alike without implying a specific shape.
 */
export default function AdminLoading() {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex items-end justify-between gap-3 border-b border-border pb-4 sm:pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="mt-5 space-y-4 sm:mt-6">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  );
}
