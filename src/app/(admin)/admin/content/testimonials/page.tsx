import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  let rows;
  try {
    rows = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    return (
      <AdminPage title="Testimonials">
        <DbDown area="Testimonials" />
      </AdminPage>
    );
  }
  return (
    <AdminPage title="Testimonials" description="Reviews shown on the homepage.">
      <TestimonialsManager rows={rows} />
    </AdminPage>
  );
}
