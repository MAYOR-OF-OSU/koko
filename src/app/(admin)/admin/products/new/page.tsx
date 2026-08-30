import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories;
  try {
    categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    return (
      <AdminPage title="New product">
        <DbDown area="Creating products" />
      </AdminPage>
    );
  }
  if (categories.length === 0) {
    return (
      <AdminPage title="New product">
        <p className="text-sm text-muted-foreground">Create a category first.</p>
      </AdminPage>
    );
  }
  return (
    <AdminPage title="New product" description="Add a piece to the catalogue.">
      <ProductForm categories={categories} />
    </AdminPage>
  );
}
