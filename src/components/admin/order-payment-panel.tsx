"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Loader2, CheckCircle2, Mail } from "@/components/ui/icon";
import {
  verifyOrderPayment,
  resolveOrderPaymentManually,
  resendReceipt,
  type VerifyOrderResult,
} from "@/server/actions/order";
import { Panel } from "@/components/admin/ui";
import { TextArea, SaveButton, useAction } from "@/components/admin/form";
import { formatNaira, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function OrderPaymentPanel({
  id,
  status,
  totalKobo,
  paystackRef,
  paidAt,
  paymentNote,
  isAdmin,
}: {
  id: string;
  status: string;
  totalKobo: number;
  paystackRef: string | null;
  paidAt: string | null;
  paymentNote: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [verifying, startVerify] = React.useTransition();
  const [verifyRes, setVerifyRes] = React.useState<VerifyOrderResult | null>(null);
  const [showManual, setShowManual] = React.useState(false);
  const [note, setNote] = React.useState("");

  const manual = useAction(() => resolveOrderPaymentManually(id, note), {
    success: "Order marked paid",
    onDone: () => {
      setShowManual(false);
      setNote("");
      router.refresh();
    },
  });
  const resend = useAction(() => resendReceipt(id), { success: "Receipt re-sent" });

  function runVerify() {
    startVerify(async () => {
      const res = await verifyOrderPayment(id);
      setVerifyRes(res);
      if (res.ok && res.resolved) {
        toast.success("Payment confirmed — order marked paid");
        router.refresh();
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  const isPaid = status === "paid";

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base">Payment</h2>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.68rem] font-medium capitalize",
            isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
          )}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>
      </div>

      {isPaid ? (
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Confirmed" value={paidAt ? formatDate(paidAt) : "—"} />
          <Row
            label="Reference"
            value={paystackRef === "manual" ? "Manual (off-Paystack)" : paystackRef || "—"}
          />
          {paymentNote && <Row label="Note" value={paymentNote} />}
          <button
            type="button"
            onClick={() => resend.run()}
            disabled={resend.pending}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[0.72rem] font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground disabled:opacity-50"
          >
            {resend.pending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
            Resend receipt
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <p className="text-sm text-muted-foreground">
            Order total <strong className="text-foreground">{formatNaira(totalKobo)}</strong>. If the
            buyer has paid but the order is still pending, re-check it with Paystack.
          </p>

          <button
            type="button"
            onClick={runVerify}
            disabled={verifying}
            className="btn-fill inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-background disabled:opacity-60"
          >
            {verifying ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Verify with Paystack
          </button>

          {verifyRes?.ok && (
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
              <p>
                Paystack: <strong className="capitalize">{verifyRes.verify.status}</strong>
                {verifyRes.verify.channel ? ` · ${verifyRes.verify.channel}` : ""} ·{" "}
                {formatNaira(verifyRes.verify.amountKobo)}
                {verifyRes.verify.paidAt ? ` · ${formatDate(verifyRes.verify.paidAt)}` : ""}
              </p>
              {verifyRes.verify.gatewayResponse && (
                <p className="mt-0.5 text-muted-foreground">{verifyRes.verify.gatewayResponse}</p>
              )}
              {verifyRes.resolved && (
                <p className="mt-1 font-medium text-emerald-700">Order marked paid.</p>
              )}
              {verifyRes.alreadyPaid && (
                <p className="mt-1 text-muted-foreground">This order is already marked paid.</p>
              )}
              {verifyRes.mismatch && (
                <p className="mt-1 text-amber-700">
                  Paystack&rsquo;s amount differs from the order total — use manual resolve if
                  you&rsquo;ve confirmed this payment.
                </p>
              )}
              {!verifyRes.resolved && !verifyRes.alreadyPaid && !verifyRes.mismatch && (
                <p className="mt-1 text-muted-foreground">
                  No successful charge yet — the order stays pending.
                </p>
              )}
            </div>
          )}

          <div className="border-t border-border pt-3">
            {isAdmin ? (
              !showManual ? (
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Mark paid manually (off-Paystack)…
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (note.trim().length < 3) {
                      toast.error("Add a short confirmation note first.");
                      return;
                    }
                    manual.run();
                  }}
                  className="space-y-2"
                >
                  <TextArea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Bank transfer confirmed 30 Aug — ref 0012345"
                    required
                  />
                  <div className="flex items-center gap-3">
                    <SaveButton pending={manual.pending}>
                      <CheckCircle2 className="size-3.5" /> Confirm paid
                    </SaveButton>
                    <button
                      type="button"
                      onClick={() => setShowManual(false)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
            ) : (
              <p className="text-xs text-muted-foreground">Manual resolution is admin-only.</p>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
