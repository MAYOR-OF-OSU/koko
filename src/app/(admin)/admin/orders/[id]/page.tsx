import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { formatNaira, formatDate } from "@/lib/format";
import { AdminPage, DbDown, Panel, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderStatusOverride } from "@/components/admin/order-status-override";
import { OrderFulfillmentControl } from "@/components/admin/order-fulfillment-control";
import { OrderPaymentPanel } from "@/components/admin/order-payment-panel";
import { TrackingTimeline, type FulfillmentStage, type DeliveryMethod } from "@/components/orders/tracking-timeline";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const session = await guardPage("orders:read");
  const isAdmin = session?.user.role === "admin";
  const { id } = await params;
  let order;
  try {
    order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  } catch {
    return (
      <AdminPage title="Order">
        <DbDown area="Order detail" />
      </AdminPage>
    );
  }
  if (!order) notFound();
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <AdminPage
      title={order.reference}
      description={`Placed ${formatDate(order.createdAt)} · ${order.email}`}
      actions={<OrderStatusSelect id={order.id} status={order.status} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <Table>
            <THead>
              <TR>
                <TH>Item</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Unit</TH>
                <TH className="text-right">Line</TH>
              </TR>
            </THead>
            <tbody>
              {order.items.map((it) => (
                <TR key={it.id}>
                  <TD>{it.name}</TD>
                  <TD className="text-right">{it.qty}</TD>
                  <TD className="text-right">{formatNaira(it.unitPriceKobo)}</TD>
                  <TD className="text-right">{formatNaira(it.unitPriceKobo * it.qty)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <OrderPaymentPanel
            id={order.id}
            status={order.status}
            totalKobo={order.totalKobo}
            paystackRef={order.paystackRef}
            paidAt={order.paidAt?.toISOString() ?? null}
            paymentNote={order.paymentNote}
            isAdmin={isAdmin}
          />

          <Panel>
            <h2 className="font-heading text-base">Delivery tracking</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What the customer sees on their tracking page.
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <OrderFulfillmentControl
                id={order.id}
                stage={order.fulfillmentStage}
                method={order.deliveryMethod}
                note={order.stageNote}
                estimatedReadyAt={order.estimatedReadyAt?.toISOString() ?? null}
              />
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <TrackingTimeline
                  stage={order.fulfillmentStage as FulfillmentStage}
                  method={order.deliveryMethod as DeliveryMethod}
                  note={order.stageNote}
                  estimatedReadyAt={order.estimatedReadyAt?.toISOString() ?? null}
                  updatedAt={order.stageUpdatedAt?.toISOString() ?? null}
                />
              </div>
            </div>
          </Panel>

          {isAdmin && <OrderStatusOverride id={order.id} status={order.status} />}
        </div>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-heading text-base">Summary</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
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
          </Panel>
          <Panel>
            <h2 className="font-heading text-base">Shipping</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {[addr.fullName, addr.street, addr.city, addr.state, addr.country, addr.phone]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
