import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  let items: { slug: string; name: string; priceKobo: number; image: string | null }[] = [];
  try {
    const rows = await prisma.wishlistItem.findMany({
      where: { userId: session?.user.id ?? "" },
      orderBy: { createdAt: "desc" },
      include: {
        product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      },
    });
    items = rows.map((r) => ({
      slug: r.product.slug,
      name: r.product.name,
      priceKobo: r.product.priceKobo,
      image: r.product.images[0]?.url ?? null,
    }));
  } catch {
    /* DB unreachable — fall through to the empty state */
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
        <p className="font-heading text-lg">Your wishlist is empty</p>
        <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
          Tap the heart on any piece to save it here for later.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block text-sm font-medium text-rose-deep hover:underline"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"} ·{" "}
        <Link href="/shop" className="underline">
          keep browsing
        </Link>
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/shop/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow hover:shadow-[0_20px_50px_-24px_rgba(42,20,55,0.4)]"
          >
            <span className="relative block aspect-square overflow-hidden bg-muted">
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </span>
            <span className="flex flex-1 flex-col gap-1 p-4">
              <span className="truncate font-heading text-[0.95rem]">{p.name}</span>
              <span className="text-sm font-medium">{formatNaira(p.priceKobo)}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
