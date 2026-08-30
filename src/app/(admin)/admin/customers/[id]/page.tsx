import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira, formatDate } from "@/lib/format";
import { AdminPage, DbDown, Panel, StatusBadge, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true },
    });
  } catch {
    return (
      <AdminPage title="Customer">
        <DbDown area="Customer detail" />
      </AdminPage>
    );
  }
  if (!user) notFound();

  return (
    <AdminPage title={user.name} description={`${user.email} · joined ${formatDate(user.createdAt)}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div>
          <h2 className="mb-3 font-heading text-lg">Orders</h2>
          {user.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Ref</TH>
                  <TH>Date</TH>
                  <TH className="text-right">Total</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <tbody>
                {user.orders.map((o) => (
                  <TR key={o.id}>
                    <TD>
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.reference}
                      </Link>
                    </TD>
                    <TD className="text-muted-foreground">{formatDate(o.createdAt)}</TD>
                    <TD className="text-right">{formatNaira(o.totalKobo)}</TD>
                    <TD>
                      <StatusBadge status={o.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <Panel>
          <h2 className="font-heading text-base">Addresses</h2>
          {user.addresses.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">None saved.</p>
          ) : (
            <ul className="mt-2 space-y-3 text-sm text-muted-foreground">
              {user.addresses.map((a) => (
                <li key={a.id}>
                  {a.fullName}, {a.street}, {a.city}, {a.state}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
