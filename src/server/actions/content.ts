"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { siteContentDefaults, type SiteSettingKey } from "@/lib/site-content-defaults";

type Result = { ok: true } | { ok: false; error: string };

function bump() {
  revalidatePath("/", "layout");
}

/**
 * Save one CMS block. `value` is the full JSON for the key (already assembled on
 * the client from the form). Merged over the default so it's always complete.
 */
export async function saveSetting(key: SiteSettingKey, value: unknown): Promise<Result> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }
  if (!(key in siteContentDefaults)) return { ok: false, error: "Unknown setting" };

  const merged = { ...siteContentDefaults[key], ...(value as object) };
  try {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: merged },
      update: { value: merged },
    });
  } catch {
    return { ok: false, error: "Could not save — is the database running?" };
  }
  await logAudit({ action: "content.save", target: key });
  bump();
  return { ok: true };
}
