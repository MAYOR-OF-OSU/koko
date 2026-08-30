"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";
import { isRole, ROLE_LABEL } from "@/lib/roles";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

/** Admin only — change a user's role. Guards against locking everyone out. */
export async function setUserRole(userId: string, role: string): Promise<Result> {
  try {
    const session = await requireAdmin();
    if (!isRole(role)) return { ok: false, error: "Unknown role" };

    if (userId === session.user.id && role !== "admin") {
      return { ok: false, error: "You can't remove your own admin access." };
    }

    if (role !== "admin") {
      const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (target?.role === "admin") {
        const admins = await prisma.user.count({ where: { role: "admin" } });
        if (admins <= 1) return { ok: false, error: "There must be at least one admin." };
      }
    }

    const u = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { email: true },
    });
    await logAudit({ action: "staff.role", target: u.email, meta: { role } });
    revalidatePath("/admin/staff");
    revalidatePath("/admin", "page");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update role" };
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.string().refine(isRole, "Unknown role"),
});

/**
 * Admin only — create a team member with sign-in credentials. Uses the admin
 * plugin's createUser so the admin's own session is untouched, then pins the
 * role + marks the address verified (there's no invite email with SMTP off).
 */
export async function createStaffUser(input: z.input<typeof createSchema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = createSchema.parse(input);

    const existing = await prisma.user.findUnique({ where: { email: d.email } });
    if (existing) return { ok: false, error: "A user with that email already exists." };

    await auth.api.createUser({
      body: { name: d.name, email: d.email, password: d.password },
      headers: await headers(),
    });

    const u = await prisma.user.update({
      where: { email: d.email },
      data: { role: d.role, emailVerified: true },
      select: { id: true, email: true },
    });

    await logAudit({
      action: "staff.create",
      target: u.email,
      meta: { role: d.role, label: ROLE_LABEL[d.role as keyof typeof ROLE_LABEL] },
    });
    revalidatePath("/admin/staff");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create the team member" };
  }
}

/** Best-effort — called from the client right before signing out. */
export async function logSignOut(): Promise<void> {
  try {
    await logAudit({ action: "auth.logout" });
  } catch {
    /* best-effort */
  }
}
