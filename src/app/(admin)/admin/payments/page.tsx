import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { formatNaira, formatDate } from "@/lib/format";
import { CreditCard } from "@/components/ui/icon";
import {
  AdminPage,
  DbDown,
  EmptyState,
  StatusBadge,
  Table,
  THead,
  TH,
  TR,
  TD,
} from "@/components/admin/ui";
import { PaymentRowActions } from "@/components/admin/payment-row-actions";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "successful", label: "Successful" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const WHERE: Record<string, unknown> = {
  all: undefined,
  pending: { status: "pending" },
  successful: { status: { in: ["paid", "fulfilled"] } },
  cancelled: { status: "cancelled" },
};

function method(paystackRef: string | null) {
  if (!paystackRef) return "—";
  if (paystackRef === "manual") return "Manual";
  return `Paystack · ${paystackRef.slice(0, 10)}…`;
}

export default async function AdminPaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  // payments:write is admin-only — the whole section is gated to admins.
  await guardPage("payments:write");
  const isAdmin = true;

  const sp = await searchParams;
  const tab = typeof sp.status === "string" && sp.status in WHERE ? sp.status : "all";

  let orders;
  let pendingTotal = 0;
  try {
    [orders, pendingTotal] = await Promise.all([
      prisma.order.findMany({
        where: WHERE[tab] as never,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reference: true,
          createdAt: true,
          email: true,
          totalKobo: true,
          status: true,
          paystackRef: true,
          paidAt: true,
        },
        take: 200,
      }),
      prisma.order
        .aggregate({ where: { status: "pending" }, _sum: { totalKobo: true } })
        .then((r) => r._sum.totalKobo ?? 0),
    ]);
  } catch {
    return (
      <AdminPage title="Payments">
        <DbDown area="Payments" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Payments"
      description={
        pendingTotal > 0
          ? `${formatNaira(pendingTotal)} awaiting confirmation across pending payments`
          : "Every order's payment status in one place"
      }
    >
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-3 text-sm">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/payments" : `/admin/payments?status=${t.key}`}
              className={`border-b pb-1 ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-5" />}
          title={tab === "all" ? "No payments yet" : `No ${tab} payments`}
          hint="Payments show up here as customers check out."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Date</TH>
              <TH>Customer</TH>
              <TH className="text-right">Amount</TH>
              <TH>Method</TH>
              <TH>Status</TH>
              <TH className="text-right">Set status</TH>
            </TR>
          </THead>
          <tbody>
            {orders.map((o) => (
              <TR key={o.id}>
                <TD>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.reference}
                  </Link>
                </TD>
                <TD className="whitespace-nowrap text-muted-foreground">
                  {formatDate(o.paidAt ?? o.createdAt)}
                </TD>
                <TD className="text-muted-foreground">{o.email}</TD>
                <TD className="text-right tabular-nums">{formatNaira(o.totalKobo)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{method(o.paystackRef)}</TD>
                <TD>
                  <StatusBadge status={o.status} />
                </TD>
                <TD className="text-right">
                  <PaymentRowActions id={o.id} status={o.status} isAdmin={isAdmin} />
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
