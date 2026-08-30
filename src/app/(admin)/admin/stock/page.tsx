import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { can, type Role } from "@/lib/roles";
import { getStoreSettings } from "@/lib/site-content";
import { AdminPage, DbDown, Panel, CardHeading, StatCard } from "@/components/admin/ui";
import { StockTable, type StockRow } from "@/components/admin/stock-table";

export const dynamic = "force-dynamic";

export default async function AdminStockPage() {
  await guardPage("stock:read");
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user.role ?? "client") as Role;
  const canEdit = can(role, "stock:write");

  let rows: StockRow[] = [];
  let threshold = 5;
  try {
    const [products, store] = await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, variants: { select: { id: true, name: true, stock: true } } },
      }),
      getStoreSettings(),
    ]);
    threshold = store.lowStockThreshold ?? 5;
    rows = products.flatMap((p) =>
      p.variants.map((v) => ({
        productId: p.id,
        productName: p.name,
        variantId: v.id,
        variantName: v.name,
        stock: v.stock,
      })),
    );
  } catch {
    return (
      <AdminPage title="Stock">
        <DbDown area="Stock" />
      </AdminPage>
    );
  }

  const lowCount = rows.filter((r) => r.stock <= threshold).length;
  const outCount = rows.filter((r) => r.stock === 0).length;
  const totalUnits = rows.reduce((n, r) => n + r.stock, 0);

  return (
    <AdminPage
      title="Stock"
      description={
        canEdit
          ? "Check and adjust on-hand quantities."
          : "Read-only — you can check what's left and alert an admin when it runs low."
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Units on hand" value={String(totalUnits)} />
        <StatCard label={`Low (≤ ${threshold})`} value={String(lowCount)} />
        <StatCard label="Out of stock" value={String(outCount)} />
      </div>
      <Panel>
        <CardHeading title="Variants" />
        <StockTable rows={rows} threshold={threshold} canEdit={canEdit} />
      </Panel>
    </AdminPage>
  );
}
