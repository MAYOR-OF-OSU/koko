import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaff, can, type Permission } from "@/lib/roles";

async function session() {
  return auth.api.getSession({ headers: await headers() });
}

/** Throws unless the caller is a signed-in admin. Admin-only server actions. */
export async function requireAdmin() {
  const s = await session();
  if (s?.user.role !== "admin") throw new Error("Not authorized");
  return s;
}

/** Throws unless the caller has any staff role (admin/manager/cashier/storekeeper). */
export async function requireStaff() {
  const s = await session();
  if (!isStaff(s?.user.role)) throw new Error("Not authorized");
  return s;
}

/** Throws unless the caller's role grants `permission`. Use in server actions. */
export async function requirePermission(permission: Permission) {
  const s = await session();
  if (!s || !can(s.user.role, permission)) throw new Error("Not authorized");
  return s;
}

/**
 * Page-level guard: bounces staff without `permission` back to the admin home
 * instead of throwing a 500. Use at the top of an admin page component.
 */
export async function guardPage(permission: Permission) {
  const s = await session();
  if (!s || !can(s.user.role, permission)) redirect("/admin");
  return s;
}
