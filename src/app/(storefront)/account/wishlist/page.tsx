import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { products } from "@/lib/mock-data";

// Placeholder: shows a couple of pieces until wishlist persistence is wired.
const saved = products.slice(2, 6);

export default function WishlistPage() {
  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {saved.length} saved {saved.length === 1 ? "piece" : "pieces"} ·{" "}
        <Link href="/shop" className="underline">
          keep browsing
        </Link>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {saved.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
