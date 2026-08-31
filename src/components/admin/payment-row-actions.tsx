"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { markPaymentSuccessful } from "@/server/actions/order";
import { useAction } from "@/components/admin/form";

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
  const { pending, run } = useAction(() => markPaymentSuccessful(id), {
    success: "Payment marked successful",
    onDone: () => router.refresh(),
  });

  if (status !== "pending") {
    return (
      <Link
        href={`/admin/orders/${id}`}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        View
      </Link>
    );
  }

  if (!isAdmin) {
    return <span className="text-xs text-muted-foreground">Awaiting payment</span>;
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Mark this payment as successful? The customer gets a receipt."))
          run();
      }}
      className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
    >
      {pending ? "Marking…" : "Mark successful"}
    </button>
  );
}
