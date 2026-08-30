import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  TrackingTimeline,
  type FulfillmentStage,
  type DeliveryMethod,
} from "@/components/orders/tracking-timeline";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  fulfilled: "bg-sky-100 text-sky-800",
  cancelled: "bg-rose-100 text-rose-800",
};

export default async function AccountOrderDetail({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;
  const email = session!.user.email;

  const order = await prisma.order.findFirst({
    where: { id, OR: [{ userId }, { email }] },
    include: { items: true },
  });
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string>;
  const isPickup = order.deliveryMethod === "pickup";

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-2xl">{order.reference}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[0.68rem] font-medium capitalize",
            STATUS[order.status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* progress */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="font-heading text-lg">
            {isPickup ? "Pickup progress" : "Delivery progress"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPickup
              ? "We'll let you know the moment it's ready to collect."
              : "Follow your order from our studio to your door."}
          </p>
          <div className="mt-5">
            <TrackingTimeline
              stage={order.fulfillmentStage as FulfillmentStage}
              method={order.deliveryMethod as DeliveryMethod}
              note={order.stageNote}
              estimatedReadyAt={order.estimatedReadyAt?.toISOString() ?? null}
              updatedAt={order.stageUpdatedAt?.toISOString() ?? null}
            />
          </div>
        </div>

        {/* details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h3 className="font-heading text-lg">Items</h3>
            <ul className="mt-3 divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{it.name}</span>
                    <span className="text-xs text-muted-foreground">Qty {it.qty}</span>
                  </span>
                  <span className="shrink-0">{formatNaira(it.unitPriceKobo * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatNaira(order.subtotalKobo)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatNaira(order.shippingKobo)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-medium">
                <dt>Total</dt>
                <dd>{formatNaira(order.totalKobo)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h3 className="font-heading text-lg">{isPickup ? "Pickup" : "Delivery address"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isPickup
                ? "Collect from our pickup point — bring your order reference and a valid ID."
                : [addr.fullName, addr.street, addr.city, addr.state, addr.country, addr.phone]
                    .filter(Boolean)
                    .join(", ") || "—"}
            </p>
            {order.estimatedReadyAt && (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">
                  {isPickup ? "Ready to collect by " : "Estimated arrival "}
                </span>
                <span className="font-medium">{formatDate(order.estimatedReadyAt)}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
