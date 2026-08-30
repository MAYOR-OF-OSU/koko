import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Append one row to the audit log. Best-effort: any failure (DB down, no
 * session, missing headers) is swallowed so a mutating action never breaks
 * because logging failed.
 */
type Actor = { id?: string | null; email?: string | null; role?: string | null };

export async function logAudit(input: {
  action: string;
  target?: string | null;
  meta?: Record<string, unknown> | null;
  /** Pass explicitly when there's no cookie session yet (e.g. the login hook). */
  actor?: Actor;
}): Promise<void> {
  try {
    let actor = input.actor ?? null;
    let ip: string | null = null;

    try {
      const h = await headers();
      ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        h.get("x-real-ip") ||
        null;
      if (!actor) {
        const s = await auth.api.getSession({ headers: h });
        if (s?.user) {
          actor = {
            id: s.user.id,
            email: s.user.email,
            role: (s.user as { role?: string | null }).role ?? null,
          };
        }
      }
    } catch {
      /* headers()/getSession unavailable in this context */
    }

    await prisma.auditEvent.create({
      data: {
        actorId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        actorRole: actor?.role ?? null,
        action: input.action,
        target: input.target ?? null,
        meta: (input.meta ?? undefined) as object | undefined,
        ip,
      },
    });
  } catch {
    /* best-effort — never throw */
  }
}
