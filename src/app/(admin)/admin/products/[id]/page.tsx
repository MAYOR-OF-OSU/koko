import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { ProductForm, type ProductFormValue } from "@/components/admin/product-form";
import { koboToNairaString } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  let data;
  try {
    const [product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
      }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    data = { product, categories };
  } catch {
    return (
      <AdminPage title="Edit product">
        <DbDown area="Editing products" />
      </AdminPage>
    );
  }
  if (!data.product) notFound();
  const p = data.product;

  const initial: ProductFormValue = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    priceNaira: koboToNairaString(p.priceKobo),
    compareAtNaira: p.compareAtKobo ? koboToNairaString(p.compareAtKobo) : "",
    description: p.description ?? "",
    status: p.status,
    featured: p.featured,
    rating: String(p.rating),
    images: p.images.length ? p.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })) : [{ url: "", alt: "" }],
    variants: p.variants.length
      ? p.variants.map((v) => ({
          name: v.name,
          sku: v.sku ?? "",
          priceNaira: v.priceKobo ? koboToNairaString(v.priceKobo) : "",
          stock: String(v.stock),
        }))
      : [{ name: "Gold", sku: "", priceNaira: "", stock: "20" }],
  };

  return (
    <AdminPage title="Edit product" description={p.name}>
      <ProductForm categories={data.categories} initial={initial} />
    </AdminPage>
  );
}
