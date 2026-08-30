"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(60).default("Nigeria"),
  isDefault: z.boolean().optional(),
});

/** Create a new address or update an existing one the caller owns. */
export async function saveAddress(
  id: string | null,
  input: z.input<typeof addressSchema>,
): Promise<Result> {
  try {
    const userId = await requireUserId();
    if (!userId) return { ok: false, error: "Please sign in again." };
    const d = addressSchema.parse(input);

    const count = await prisma.address.count({ where: { userId } });
    const makeDefault = d.isDefault || count === 0; // first address is the default

    if (id) {
      const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
      if (!owned) return { ok: false, error: "Address not found." };
    }

    await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const data = {
        fullName: d.fullName,
        phone: d.phone,
        street: d.street,
        city: d.city,
        state: d.state,
        country: d.country,
        isDefault: makeDefault,
      };
      if (id) await tx.address.update({ where: { id }, data });
      else await tx.address.create({ data: { ...data, userId } });
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save the address." };
  }
}

export async function deleteAddress(id: string): Promise<Result> {
  try {
    const userId = await requireUserId();
    if (!userId) return { ok: false, error: "Please sign in again." };

    const target = await prisma.address.findFirst({
      where: { id, userId },
      select: { id: true, isDefault: true },
    });
    if (!target) return { ok: false, error: "Address not found." };

    await prisma.address.delete({ where: { id } });

    // If we removed the default, promote the most recent remaining one.
    if (target.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { id: "desc" },
        select: { id: true },
      });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete the address." };
  }
}

export async function setDefaultAddress(id: string): Promise<Result> {
  try {
    const userId = await requireUserId();
    if (!userId) return { ok: false, error: "Please sign in again." };

    const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return { ok: false, error: "Address not found." };

    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update the default." };
  }
}
