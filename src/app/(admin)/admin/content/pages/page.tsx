import { AdminPage } from "@/components/admin/ui";
import { getSetting } from "@/lib/site-content";
import { AboutEditor, FaqEditor } from "@/components/admin/pages-editor";

export const dynamic = "force-dynamic";

export default async function AdminPagesContent() {
  const [about, faq] = await Promise.all([getSetting("pages.about"), getSetting("pages.faq")]);
  return (
    <AdminPage title="Pages" description="Copy for the About and FAQ pages.">
      <div className="space-y-6">
        <AboutEditor initial={about} />
        <FaqEditor initial={faq} />
      </div>
    </AdminPage>
  );
}
