import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown, EmptyState, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let rows;
  try {
    rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
  } catch {
    return (
      <AdminPage title="Categories">
        <DbDown area="Categories" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Categories"
      description={`${rows.length} collections`}
      actions={
        <Link
          href="/admin/categories/new"
          className="btn-fill inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="size-3.5" /> New category
        </Link>
      }
    >
      {rows.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Category</TH>
              <TH>Slug</TH>
              <TH className="text-right">Products</TH>
              <TH className="text-right">Order</TH>
            </TR>
          </THead>
          <tbody>
            {rows.map((c) => (
              <TR key={c.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                      {c.image && <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />}
                    </span>
                    <Link href={`/admin/categories/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </div>
                </TD>
                <TD className="text-muted-foreground">{c.slug}</TD>
                <TD className="text-right">{c._count.products}</TD>
                <TD className="text-right text-muted-foreground">{c.sortOrder}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
