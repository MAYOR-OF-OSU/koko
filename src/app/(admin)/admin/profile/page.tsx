import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { ProfileForm, PasswordForm } from "@/components/admin/profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await guardPage("overview");

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, bio: true, image: true },
    });
  } catch {
    return (
      <AdminPage title="My profile">
        <DbDown area="Your profile" />
      </AdminPage>
    );
  }
  if (!user) {
    return (
      <AdminPage title="My profile">
        <DbDown area="Your profile" />
      </AdminPage>
    );
  }

  return (
    <AdminPage title="My profile" description="Your account details and password.">
      <div className="max-w-3xl space-y-6">
        <ProfileForm
          initial={{
            name: user.name ?? "",
            email: user.email ?? "",
            phone: user.phone ?? "",
            bio: user.bio ?? "",
            image: user.image ?? "",
          }}
        />
        <PasswordForm />
      </div>
    </AdminPage>
  );
}
