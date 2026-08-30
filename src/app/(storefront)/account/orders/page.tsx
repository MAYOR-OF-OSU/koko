import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  fulfilled: "bg-sky-100 text-sky-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const thumbIds = [...new Set(orders.map((o) => o.items[0]?.productId).filter(Boolean))] as string[];
  const images = thumbIds.length
    ? await prisma.productImage.findMany({
        where: { productId: { in: thumbIds }, sortOrder: 0 },
        select: { productId: true, url: true },
      })
    : [];
  const thumb = new Map(images.map((i) => [i.productId, i.url]));

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="font-medium">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your order history appears here once you place an order.{" "}
          <Link href="/shop" className="text-rose-deep hover:underline">
            Start shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl">Orders &amp; returns</h2>
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-sm">
            <span className="font-medium">{o.reference}</span>
            <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.68rem] font-medium capitalize",
                STATUS[o.status] ?? "bg-muted text-muted-foreground",
              )}
            >
              {o.status}
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {o.items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {it.productId && thumb.get(it.productId) && (
                    <Image src={thumb.get(it.productId)!} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                </div>
                <span className="shrink-0 text-sm">{formatNaira(it.unitPriceKobo * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
              {o.items.reduce((n, i) => n + i.qty, 0)} item(s)
            </span>
            <div className="flex items-center gap-4">
              <Link href={`/account/orders/${o.id}`} className="text-[0.8rem] font-medium text-rose-deep hover:underline">
                Track order
              </Link>
              <span className="font-heading">{formatNaira(o.totalKobo)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
