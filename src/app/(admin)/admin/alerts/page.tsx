import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { can, type Role } from "@/lib/roles";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { AlertsList, type AlertItem } from "@/components/admin/alerts-list";

export const dynamic = "force-dynamic";

export default async function AdminAlertsPage() {
  await guardPage("alerts:raise");
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user.role ?? "client") as Role;
  const canResolve = can(role, "alerts:resolve");

  let rows;
  try {
    rows = await prisma.stockAlert.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  } catch {
    return (
      <AdminPage title="Stock alerts">
        <DbDown area="Stock alerts" />
      </AdminPage>
    );
  }

  const map = (a: (typeof rows)[number]): AlertItem => ({
    id: a.id,
    productName: a.productName,
    variantName: a.variantName,
    stock: a.stock,
    note: a.note,
    raisedBy: a.raisedBy,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
  });

  return (
    <AdminPage
      title="Stock alerts"
      description="Low-stock notifications raised by the team."
    >
      <AlertsList
        open={rows.filter((a) => a.status === "open").map(map)}
        resolved={rows.filter((a) => a.status === "resolved").map(map)}
        canResolve={canResolve}
      />
    </AdminPage>
  );
}
