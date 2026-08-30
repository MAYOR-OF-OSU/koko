"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeft, LogOut, ExternalLink, Search, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/auth-client";
import { logSignOut } from "@/server/actions/staff";
import { adminNav, isActive } from "@/lib/admin-nav";
import { can, ROLE_LABEL, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

function NavList({
  role,
  collapsed,
  onNavigate,
  query,
}: {
  role: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  query?: string;
}) {
  const pathname = usePathname();
  const q = (query ?? "").trim().toLowerCase();
  const groups = adminNav
    .map((g) => ({
      ...g,
      links: g.links.filter(
        (l) => can(role, l.permission) && (!q || l.label.toLowerCase().includes(q)),
      ),
    }))
    .filter((g) => g.links.length > 0);

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {q && groups.length === 0 && (
        <p className="px-3 text-sm text-muted-foreground">No matches for “{query}”.</p>
      )}
      {groups.map((group, gi) => (
        <div key={group.title || gi}>
          {group.title && !collapsed && (
            <p className="px-2 pb-2 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
              {group.title}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.links.map((l) => {
              const active = isActive(pathname, l);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onNavigate}
                  title={collapsed ? l.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <l.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{l.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SignOutButton({ collapsed }: { collapsed?: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await logSignOut().catch(() => {});
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
        collapsed && "justify-center",
      )}
      title={collapsed ? "Sign out" : undefined}
    >
      <LogOut className="size-4 shrink-0" />
      {!collapsed && "Sign out"}
    </button>
  );
}

function usePageLabel() {
  const pathname = usePathname();
  const all = adminNav.flatMap((g) => g.links);
  const match = all
    .filter((l) => (l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(l.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (match) return match.label;
  const seg = pathname.split("/").filter(Boolean).pop() ?? "Admin";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative px-3 pb-3">
      <Search className="pointer-events-none absolute left-6 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter menu…"
        aria-label="Filter menu"
        className="w-full rounded-full border border-border bg-secondary/60 py-2 pl-8 pr-3 text-xs outline-none transition-[border-color,box-shadow] duration-150 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25"
      />
    </div>
  );
}

export function AdminShell({
  user,
  openAlerts = 0,
  children,
}: {
  user: { name?: string | null; email?: string | null; role?: string | null; image?: string | null };
  openAlerts?: number;
  children: React.ReactNode;
}) {
  const role = (user.role ?? "client") as Role;
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const pageLabel = usePageLabel();

  React.useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore of a persisted UI preference
      setCollapsed(localStorage.getItem("tj-admin-collapsed") === "1");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("tj-admin-collapsed", next ? "1" : "0");
      } catch {}
      if (next) setQuery("");
      return next;
    });
  };

  return (
    // Fill the viewport on desktop (sidebar + content well); on mobile just wrap the
    // content so short pages don't leave a tall empty band below the last card.
    <div className="admin-shell flex bg-secondary/30 lg:min-h-svh">
      {/* desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      >
        <div className={cn("flex items-center gap-2 px-4 py-4", collapsed && "justify-center px-2")}>
          <Link href="/" aria-label="Timi's Jewels">
            <Logo variant={collapsed ? "monogram" : "lockup"} className={collapsed ? "h-7" : "h-6"} />
          </Link>
        </div>
        {!collapsed && <SearchBox value={query} onChange={setQuery} />}
        <NavList role={role} collapsed={collapsed} query={query} />
        <div className="border-t border-border p-3">
          <SignOutButton collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <button
            onClick={toggle}
            className="hidden size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:grid"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-64 flex-col p-0">
              <SheetTitle className="px-4 pt-4">
                <Logo variant="lockup" className="h-6" />
              </SheetTitle>
              <div className="pt-3">
                <SearchBox value={query} onChange={setQuery} />
              </div>
              <NavList
                role={role}
                query={query}
                onNavigate={() => {
                  setMobileOpen(false);
                  setQuery("");
                }}
              />
              <div className="border-t border-border p-3">
                <SignOutButton />
              </div>
            </SheetContent>
          </Sheet>

          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Dashboard</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-heading">{pageLabel}</span>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              data-press
              className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <ExternalLink className="size-3.5" /> View site
            </Link>
            <Link
              href="/admin/alerts"
              data-press
              aria-label={`Stock alerts${openAlerts ? ` (${openAlerts} open)` : ""}`}
              className="relative grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Bell className="size-4" />
              {openAlerts > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {openAlerts}
                </span>
              )}
            </Link>
            <Link
              href="/admin/profile"
              title="My profile"
              data-press
              className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-secondary"
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
                  {(user.name ?? user.email ?? "A").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="hidden text-xs leading-tight sm:block">
                <p className="text-foreground">{user.email}</p>
                <p className="text-muted-foreground">{ROLE_LABEL[role] ?? role}</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
