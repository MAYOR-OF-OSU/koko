import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { StaffManager, type StaffUser } from "@/components/admin/staff-manager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  await guardPage("staff:write");
  const session = await auth.api.getSession({ headers: await headers() });

  let users: StaffUser[] = [];
  try {
    const rows = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      take: 500,
    });
    users = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch {
    return (
      <AdminPage title="Staff & roles">
        <DbDown area="Staff & roles" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Staff & roles"
      description="Add team members, hand out sign-in details, and assign what each can do."
    >
      <StaffManager users={users} selfId={session?.user.id ?? ""} />
    </AdminPage>
  );
}
