import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { ShoppingBag, Heart, Package, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, timeAgo } from "@/lib/format";
import { CategoryDonut } from "@/components/admin/mini-chart";
import { CartStat } from "@/components/account/cart-stat";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const paid = (s: string) => s === "paid" || s === "fulfilled";

async function getData(userId: string) {
  const [wishlistCount, orders, orderItems] = await Promise.all([
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { userId } },
      select: { unitPriceKobo: true, qty: true, productId: true },
    }),
  ]);

  const productIds = [...new Set(orders.flatMap((o) => o.items.map((i) => i.productId).filter(Boolean)))] as string[];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { name: true } } },
      })
    : [];
  const pImage = new Map(products.map((p) => [p.id, p.images[0]?.url ?? null]));
  const pCategory = new Map(products.map((p) => [p.id, p.category.name]));

  const catMap = new Map<string, number>();
  for (const it of orderItems) {
    const name = (it.productId && pCategory.get(it.productId)) || "Other";
    catMap.set(name, (catMap.get(name) ?? 0) + it.unitPriceKobo * it.qty);
  }
  const spendByCategory = [...catMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  return {
    wishlistCount,
    orderCount: orders.length,
    cancelledCount: orders.filter((o) => o.status === "cancelled").length,
    spent: orders.filter((o) => paid(o.status)).reduce((n, o) => n + o.totalKobo, 0),
    spendByCategory,
    recent: orders.slice(0, 5).map((o) => ({
      id: o.id,
      reference: o.reference,
      status: o.status,
      createdAt: o.createdAt,
      totalKobo: o.totalKobo,
      title: o.items.map((i) => i.name).join(", ") || "Order",
      thumb: (o.items[0]?.productId && pImage.get(o.items[0].productId)) || null,
    })),
  };
}

function StatCard({
  label,
  value,
  href,
  cta,
  icon: Icon,
  tint,
}: {
  label: string;
  value: React.ReactNode;
  href: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border p-5", tint)}>
      <p className="font-heading text-3xl leading-none">{value}</p>
      <p className="mt-2 text-sm text-foreground/70">{label}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-rose-deep hover:underline">
        {cta} <ArrowRight className="size-3" />
      </Link>
      <span className="absolute -bottom-3 -right-3 grid size-16 place-items-center rounded-full bg-card/60">
        <Icon className="size-5 text-foreground/50" />
      </span>
    </div>
  );
}

export default async function AccountOverview() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;
  const d = await getData(userId);

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Items in your cart"
          value={<CartStat />}
          href="/cart"
          cta="View my cart"
          icon={ShoppingBag}
          tint="bg-[color-mix(in_oklch,var(--rose)_13%,var(--card))]"
        />
        <StatCard
          label="Items in your wishlist"
          value={d.wishlistCount}
          href="/account/wishlist"
          cta="View wishlist"
          icon={Heart}
          tint="bg-[color-mix(in_oklch,var(--rose-deep)_11%,var(--card))]"
        />
        <StatCard
          label="Orders placed"
          value={d.orderCount}
          href="/account/orders"
          cta="View all orders"
          icon={Package}
          tint="bg-[color-mix(in_oklch,var(--accent-gold)_16%,var(--card))]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* sales / spend */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">Spend by category</h2>
          </div>
          <CategoryDonut data={d.spendByCategory} />
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span><strong>{d.orderCount}</strong> <span className="text-muted-foreground">orders</span></span>
            <span><strong>{d.cancelledCount}</strong> <span className="text-muted-foreground">cancelled</span></span>
            <span><strong>{formatNaira(d.spent)}</strong> <span className="text-muted-foreground">spent</span></span>
          </div>
        </div>

        {/* recent orders */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">My orders</h2>
            <Link href="/account/orders" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet. <Link href="/shop" className="text-rose-deep hover:underline">Start shopping</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {d.recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {o.thumb && <Image src={o.thumb} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.reference} · {o.status} {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm">{formatNaira(o.totalKobo)}</p>
                    <Link href={`/account/orders/${o.id}`} className="text-[0.7rem] text-rose-deep hover:underline">
                      Track order
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
