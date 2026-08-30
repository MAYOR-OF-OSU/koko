import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your Timi's Jewels orders, wishlist, addresses and profile.",
  robots: { index: false },
};

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/account");

  const user = session.user as { name?: string; email?: string; role?: string };

  return (
    <div className="min-h-[70svh] bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl">
          Hi, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome to your dashboard</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountNav user={{ name: user.name, email: user.email, role: user.role }} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
