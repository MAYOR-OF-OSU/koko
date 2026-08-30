import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  let c;
  try {
    c = await prisma.category.findUnique({ where: { id } });
  } catch {
    return (
      <AdminPage title="Edit category">
        <DbDown area="Editing categories" />
      </AdminPage>
    );
  }
  if (!c) notFound();
  return (
    <AdminPage title="Edit category" description={c.name}>
      <CategoryForm
        initial={{
          id: c.id,
          name: c.name,
          slug: c.slug,
          blurb: c.blurb ?? "",
          image: c.image ?? "",
          sortOrder: String(c.sortOrder),
        }}
      />
    </AdminPage>
  );
}
