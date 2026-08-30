"use client";

import Link from "next/link";
import { Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, toggleProductFeatured } from "@/server/actions/product";
import { useAction } from "@/components/admin/form";
import { cn } from "@/lib/utils";

export function ProductRowActions({
  id,
  featured,
}: {
  id: string;
  featured: boolean;
}) {
  const del = useAction(deleteProduct, { success: "Product deleted" });
  const feat = useAction(toggleProductFeatured, { success: "Updated" });

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        aria-label={featured ? "Unfeature" : "Feature on homepage"}
        onClick={() => feat.run(id, !featured)}
        disabled={feat.pending}
        className={cn(
          "grid size-8 place-items-center rounded-md hover:bg-secondary",
          featured ? "text-accent-gold" : "text-muted-foreground",
        )}
      >
        <Star className={cn("size-4", featured && "fill-current")} />
      </button>
      <Link
        href={`/admin/products/${id}`}
        aria-label="Edit"
        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="size-4" />
      </Link>
      <button
        aria-label="Delete"
        disabled={del.pending}
        onClick={() => {
          if (confirm("Delete this product? This cannot be undone.")) del.run(id);
          else toast.dismiss();
        }}
        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
