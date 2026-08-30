"use client";

import * as React from "react";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupOrder, type TrackedOrder } from "@/server/actions/order";
import { formatDate } from "@/lib/format";
import {
  TrackingTimeline,
  type FulfillmentStage,
  type DeliveryMethod,
} from "@/components/orders/tracking-timeline";

export default function TrackOrderPage() {
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const reference = String(fd.get("ref") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    setError(null);
    start(async () => {
      const res = await lookupOrder({ reference, email });
      if (res.ok) {
        setOrder(res.order);
      } else {
        setOrder(null);
        setError(res.error);
      }
    });
  }

  return (
    <>
      <PageHero
        eyebrow="Orders"
        title="Track your order"
        subtitle="Enter the reference from your confirmation email or SMS, plus the email you ordered with."
      />
      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="ref">Order reference</Label>
            <Input id="ref" name="ref" placeholder="TJ-XXXXXX" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@email.com" required />
          </div>
          <Button
            type="submit"
            size="lg"
            className="btn-fill w-full sm:col-span-2"
            disabled={pending}
          >
            {pending ? "Checking…" : "Track order"}
          </Button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {error} If you checked out as a guest and it&apos;s very recent, try again shortly or
            message us on WhatsApp.
          </p>
        )}

        {order && (
          <div className="mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-xl">{order.reference}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.qty, 0)}{" "}
                  item(s)
                </p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium capitalize">
                {order.status}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h3 className="font-heading text-lg">
                {order.deliveryMethod === "pickup" ? "Pickup progress" : "Delivery progress"}
              </h3>
              <div className="mt-5">
                <TrackingTimeline
                  stage={order.fulfillmentStage as FulfillmentStage}
                  method={order.deliveryMethod as DeliveryMethod}
                  note={order.stageNote}
                  estimatedReadyAt={order.estimatedReadyAt}
                  updatedAt={order.stageUpdatedAt}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 text-sm sm:p-6">
              <h3 className="font-heading text-base">In this order</h3>
              <ul className="mt-2 divide-y divide-border">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span>{it.name}</span>
                    <span className="text-muted-foreground">Qty {it.qty}</span>
                  </li>
                ))}
              </ul>
              {order.deliveryMethod === "delivery" && order.address.city && (
                <p className="mt-3 border-t border-border pt-3 text-muted-foreground">
                  Delivering to {[order.address.city, order.address.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
