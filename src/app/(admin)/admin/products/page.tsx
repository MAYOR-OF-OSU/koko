import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, StatusBadge, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products;
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: true },
      take: 200,
    });
  } catch {
    return (
      <AdminPage title="Products">
        <DbDown area="Products" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Products"
      description={`${products.length} in the catalogue`}
      actions={
        <Link
          href="/admin/products/new"
          className="btn-fill inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="size-3.5" /> New product
        </Link>
      }
    >
      {products.length === 0 ? (
        <EmptyState title="No products yet" hint="Create your first product to see it in the shop." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Category</TH>
              <TH className="text-right">Price</TH>
              <TH>Stock</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <TR key={p.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </span>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                    </div>
                  </TD>
                  <TD className="text-muted-foreground">{p.category.name}</TD>
                  <TD className="text-right">{formatNaira(p.priceKobo)}</TD>
                  <TD className={stock === 0 ? "text-rose-deep" : "text-muted-foreground"}>{stock}</TD>
                  <TD>
                    <StatusBadge status={p.status} />
                  </TD>
                  <TD>
                    <ProductRowActions id={p.id} featured={p.featured} />
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
