"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  bio: z.string().trim().max(400).optional(),
  image: z.string().trim().max(500).optional(),
});

/** Any staff member — update their own bio-data. Email must stay unique. */
export async function updateMyProfile(input: z.input<typeof profileSchema>): Promise<Result> {
  try {
    const session = await requireStaff();
    if (!session) return { ok: false, error: "Not authorized" };
    const d = profileSchema.parse(input);

    if (d.email.toLowerCase() !== session.user.email.toLowerCase()) {
      const taken = await prisma.user.findFirst({
        where: { email: d.email, NOT: { id: session.user.id } },
        select: { id: true },
      });
      if (taken) return { ok: false, error: "That email is already in use." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone?.trim() || null,
        bio: d.bio?.trim() || null,
        image: d.image?.trim() || null,
      },
    });

    await logAudit({ action: "profile.update", target: d.email });
    revalidatePath("/admin/profile");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return { ok: false, error: "That email is already in use." };
    }
    return { ok: false, error: e instanceof Error ? e.message : "Could not update your profile" };
  }
}
