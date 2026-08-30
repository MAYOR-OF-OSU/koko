"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { overrideOrderStatus, type OrderStatus } from "@/server/actions/order";
import { Panel } from "@/components/admin/ui";
import { Field, Select, TextArea, SaveButton, useAction } from "@/components/admin/form";

const OPTIONS: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];

export function OrderStatusOverride({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [target, setTarget] = React.useState<OrderStatus>(status as OrderStatus);
  const [reason, setReason] = React.useState("");

  const { pending, run } = useAction(() => overrideOrderStatus(id, { status: target, reason }), {
    success: "Order status overridden",
    onDone: () => {
      setReason("");
      router.refresh();
    },
  });

  const changed = target !== status;
  const reversingPayment =
    (status === "paid" || status === "fulfilled") &&
    (target === "pending" || target === "cancelled");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!changed) {
      toast.error("Pick a different status to override to.");
      return;
    }
    if (reason.trim().length < 3) {
      toast.error("Add a short reason for the override.");
      return;
    }
    if (!confirm(`Override this order from "${status}" to "${target}"?`)) return;
    run();
  }

  return (
    <Panel>
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 text-amber-600" />
        <h2 className="font-heading text-base">Override status</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Admin-only. Forces the order to any status and records who changed it and why. Reversing a
        settled order also clears its payment record.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Field label="New status">
          <Select
            className="max-w-40 capitalize"
            value={target}
            onChange={(e) => setTarget(e.target.value as OrderStatus)}
          >
            {OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Reason" hint="Saved to the order and shown in the audit log.">
          <TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Buyer disputed the charge — reverting to pending while we investigate"
            required
          />
        </Field>

        {reversingPayment && (
          <p className="text-xs font-medium text-amber-700">
            This clears paidAt and the payment reference for {status === "paid" ? "a paid" : "a fulfilled"}{" "}
            order.
          </p>
        )}

        <SaveButton pending={pending}>Override status</SaveButton>
      </form>
    </Panel>
  );
}
