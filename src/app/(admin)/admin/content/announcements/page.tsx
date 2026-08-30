import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  let rows;
  try {
    rows = await prisma.announcement.findMany({ orderBy: { sortOrder: "asc" } });
  } catch {
    return (
      <AdminPage title="Announcements">
        <DbDown area="Announcements" />
      </AdminPage>
    );
  }
  return (
    <AdminPage title="Announcements" description="The scrolling bar at the top of the site.">
      <AnnouncementsManager rows={rows} />
    </AdminPage>
  );
}
