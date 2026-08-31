"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star } from "@/components/ui/icon";
import { toast } from "sonner";
import type { MockProduct } from "@/lib/mock-data";
import { getCategory } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { BLUR_DATA_URL } from "@/lib/image-loader";
import { cn } from "@/lib/utils";

function reviewCount(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return 12 + (h % 240);
}

export function ProductCard({
  product,
  priority,
  className,
}: {
  product: MockProduct;
  priority?: boolean;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const cat = getCategory(product.categorySlug);

  const addToCart = () =>
    add({
      productSlug: product.slug,
      name: product.name,
      image: product.image,
      priceKobo: product.priceKobo,
    });

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow hover:shadow-[0_20px_50px_-24px_rgba(42,20,55,0.4)]",
        className,
      )}
    >
      <Link href={`/shop/${product.slug}`} className="card-sheen relative block aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
          className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
        />
        {(cat || product.badge === "sale") && (
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start gap-2">
            {product.badge === "sale" && (
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-primary-foreground">
                Sale
              </span>
            )}
            {cat && (
              <span className="ml-auto min-w-0 truncate rounded-full bg-background/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-foreground/70 backdrop-blur">
                {cat.name}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          aria-label={`Save ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            toast.success("Saved to wishlist");
          }}
          className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-background/85 text-foreground/70 opacity-0 backdrop-blur transition hover:text-primary group-hover:opacity-100"
        >
          <Heart className="size-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-heading text-[0.95rem]">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-primary text-primary" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({reviewCount(product.slug)} Reviews)</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2 text-sm">
          <span className={product.compareAtKobo ? "font-medium text-primary" : "font-medium"}>
            {formatNaira(product.priceKobo)}
          </span>
          {product.compareAtKobo && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(product.compareAtKobo)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={addToCart}
            className="flex-1 whitespace-nowrap rounded-full border border-foreground/20 px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] transition hover:border-foreground hover:bg-secondary"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => {
              addToCart();
              router.push("/cart");
            }}
            className="flex-1 whitespace-nowrap rounded-full bg-foreground px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-background transition hover:opacity-90"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
