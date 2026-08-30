import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let rows;
  try {
    const users = await prisma.user.findMany({
      where: { role: "client" },
      orderBy: { createdAt: "desc" },
      include: { orders: { select: { totalKobo: true, status: true } } },
      take: 200,
    });
    rows = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      orderCount: u.orders.length,
      spend: u.orders
        .filter((o) => o.status === "paid" || o.status === "fulfilled")
        .reduce((n, o) => n + o.totalKobo, 0),
    }));
  } catch {
    return (
      <AdminPage title="Customers">
        <DbDown area="Customers" />
      </AdminPage>
    );
  }

  return (
    <AdminPage title="Customers" description={`${rows.length} registered`}>
      {rows.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Joined</TH>
              <TH className="text-right">Orders</TH>
              <TH className="text-right">Spend</TH>
            </TR>
          </THead>
          <tbody>
            {rows.map((c) => (
              <TR key={c.id}>
                <TD>
                  <Link href={`/admin/customers/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </TD>
                <TD className="text-muted-foreground">{c.email}</TD>
                <TD className="text-muted-foreground">{formatDate(c.createdAt)}</TD>
                <TD className="text-right">{c.orderCount}</TD>
                <TD className="text-right">{formatNaira(c.spend)}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
