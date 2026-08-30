import { AdminPage } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <AdminPage title="New category">
      <CategoryForm />
    </AdminPage>
  );
}
