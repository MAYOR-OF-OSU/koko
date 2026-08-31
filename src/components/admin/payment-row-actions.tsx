"use client";

import { useRouter } from "next/navigation";
import { markPaymentSuccessful, overrideOrderStatus, type OrderStatus } from "@/server/actions/order";
import { Select, useAction } from "@/components/admin/form";

const OPTIONS: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled"];

/** Admin-only inline status control for a transaction on the Payments list.
 *  pending → paid routes through markPaymentSuccessful (emails the receipt);
 *  every other transition is a straight admin override. Non-admins see nothing. */
export function PaymentRowActions({
  id,
  status,
  isAdmin,
}: {
  id: string;
  status: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { pending, run } = useAction(
    (next: OrderStatus) =>
      status === "pending" && next === "paid"
        ? markPaymentSuccessful(id)
        : overrideOrderStatus(id, { status: next }),
    { success: "Transaction status updated", onDone: () => router.refresh() },
  );

  if (!isAdmin) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Select
      className="ml-auto max-w-36 capitalize"
      defaultValue={status}
      disabled={pending}
      aria-label="Change transaction status"
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        if (next === status) return;
        const reversing =
          (status === "paid" || status === "fulfilled") &&
          (next === "pending" || next === "cancelled");
        if (
          reversing &&
          !confirm(
            `Change this transaction from "${status}" to "${next}"? This clears the payment record.`,
          )
        ) {
          e.target.value = status; // undo the picker
          return;
        }
        run(next);
      }}
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </Select>
  );
}
