"use client";

import * as React from "react";
import { updateOrderFulfillment } from "@/server/actions/order";
import { FULFILLMENT_STAGES, type FulfillmentStage } from "@/components/orders/tracking-timeline";
import { Field, TextInput, TextArea, Select, SaveButton, useAction } from "@/components/admin/form";

const STAGE_LABEL: Record<FulfillmentStage, string> = {
  received: "Order received",
  packaged: "Packaged",
  dispatched: "Sent out",
  in_transit: "In transit",
  arriving: "Almost at destination",
  ready_pickup: "Ready for pickup",
  delivered: "Delivered / Picked up",
};

export function OrderFulfillmentControl({
  id,
  stage,
  method,
  note,
  estimatedReadyAt,
}: {
  id: string;
  stage: string;
  method: string;
  note: string | null;
  estimatedReadyAt: string | null;
}) {
  const [v, setV] = React.useState({
    stage,
    method,
    note: note ?? "",
    eta: estimatedReadyAt ? estimatedReadyAt.slice(0, 10) : "",
  });
  const { pending, run } = useAction(
    () =>
      updateOrderFulfillment(id, {
        stage: v.stage as FulfillmentStage,
        deliveryMethod: v.method as "delivery" | "pickup",
        note: v.note.trim() || undefined,
        estimatedReadyAt: v.eta || undefined,
      }),
    { success: "Tracking updated" },
  );
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Delivery stage">
          <Select value={v.stage} onChange={(e) => set("stage", e.target.value)}>
            {FULFILLMENT_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Method">
          <Select value={v.method} onChange={(e) => set("method", e.target.value)}>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </Select>
        </Field>
      </div>
      <Field label="Ready / arrival date" hint="Shown to the customer as an estimate">
        <TextInput type="date" value={v.eta} onChange={(e) => set("eta", e.target.value)} />
      </Field>
      <Field label="Note to customer" hint="Optional — appears on their tracking page">
        <TextArea
          value={v.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="e.g. Courier will call on arrival."
        />
      </Field>
      <SaveButton pending={pending}>Update tracking</SaveButton>
    </form>
  );
}
