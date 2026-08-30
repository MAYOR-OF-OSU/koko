"use client";

import { updateOrderStatus, type OrderStatus } from "@/server/actions/order";
import { Select, useAction } from "@/components/admin/form";

const OPTIONS: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const { pending, run } = useAction(updateOrderStatus, { success: "Status updated" });
  return (
    <Select
      className="max-w-40 capitalize"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => run(id, e.target.value as OrderStatus)}
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </Select>
  );
}
