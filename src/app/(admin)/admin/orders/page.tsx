import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, StatusBadge, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;

  let orders;
  try {
    orders = await prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
      take: 200,
    });
  } catch {
    return (
      <AdminPage title="Orders">
        <DbDown area="Orders" />
      </AdminPage>
    );
  }

  const tabs = ["all", "pending", "paid", "fulfilled", "cancelled"];

  return (
    <AdminPage title="Orders" description={`${orders.length} order${orders.length === 1 ? "" : "s"}`}>
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-3 text-sm">
        {tabs.map((t) => {
          const active = (t === "all" && !status) || t === status;
          return (
            <Link
              key={t}
              href={t === "all" ? "/admin/orders" : `/admin/orders?status=${t}`}
              className={`border-b pb-1 capitalize ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders" hint="Orders appear here once online checkout is live." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Ref</TH>
              <TH>Date</TH>
              <TH>Customer</TH>
              <TH className="text-right">Items</TH>
              <TH className="text-right">Total</TH>
              <TH>Status</TH>
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
                <TD className="text-muted-foreground">{formatDate(o.createdAt)}</TD>
                <TD className="text-muted-foreground">{o.email}</TD>
                <TD className="text-right">{o._count.items}</TD>
                <TD className="text-right">{formatNaira(o.totalKobo)}</TD>
                <TD>
                  <StatusBadge status={o.status} />
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
