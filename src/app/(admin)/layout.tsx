import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/roles";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/admin");
  if (!isStaff(session.user.role)) redirect("/account");

  let openAlerts = 0;
  try {
    openAlerts = await prisma.stockAlert.count({ where: { status: "open" } });
  } catch {
    /* DB down — show 0 */
  }

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role ?? "client",
        image: session.user.image ?? null,
      }}
      openAlerts={openAlerts}
    >
      {children}
    </AdminShell>
  );
}
