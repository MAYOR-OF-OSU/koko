import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <ProfileForm name={session?.user.name ?? ""} email={session?.user.email ?? ""} />;
}
