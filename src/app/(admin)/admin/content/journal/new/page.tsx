import { AdminPage } from "@/components/admin/ui";
import { JournalForm } from "@/components/admin/journal-form";

export default function NewJournalPostPage() {
  return (
    <AdminPage title="New post">
      <JournalForm />
    </AdminPage>
  );
}
