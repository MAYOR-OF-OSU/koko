"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  MapPin,
  LogOut,
  Shield,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { logSignOut } from "@/server/actions/staff";
import { isStaff } from "@/lib/roles";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  { items: [{ href: "/account", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Orders",
    items: [
      { href: "/account/orders", label: "Orders & Returns", icon: Package },
      { href: "/account/wishlist", label: "My Wishlist", icon: Heart },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/account/settings", label: "Profile", icon: User },
      { href: "/account/addresses", label: "Manage Addresses", icon: MapPin },
    ],
  },
];

export function AccountNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const link = (i: Item) => {
    const active = pathname === i.href;
    const base =
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors";
    return (
      <Link
        key={i.href}
        href={i.href}
        className={cn(
          base,
          "relative",
          active
            ? "bg-accent text-accent-foreground before:absolute before:inset-y-1.5 before:-left-0.5 before:w-1 before:rounded-full before:bg-rose-deep"
            : "text-foreground/75 hover:bg-secondary/60 hover:text-foreground",
        )}
      >
        <i.icon className="size-4 shrink-0" />
        {i.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4">
      {isStaff(user.role) && (
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-lg bg-foreground px-3 py-2 text-sm text-background transition hover:opacity-90"
        >
          <Shield className="size-4 shrink-0" />
          Admin dashboard
        </Link>
      )}

      {GROUPS.map((g, gi) => (
        <div key={g.title ?? gi}>
          {g.title && (
            <p className="px-3 pb-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              {g.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">{g.items.map(link)}</div>
        </div>
      ))}

      <div className="mt-1 border-t border-border pt-4">
        <div className="flex items-center gap-3 px-1">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
            {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logSignOut().catch(() => {});
            await signOut();
            router.push("/");
            router.refresh();
          }}
          className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </nav>
  );
}
