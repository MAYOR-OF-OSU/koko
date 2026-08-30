"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

export type MediaAssetLite = {
  id: string;
  kind: "image" | "video";
  url: string;
  name: string;
  source: string;
  createdBy: string | null;
  createdAt: string;
};

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i;

/** For the library grid and the "pick from library" dialog. */
export async function listMedia(
  kind?: "image" | "video",
): Promise<{ ok: true; assets: MediaAssetLite[] } | { ok: false; error: string }> {
  try {
    await requirePermission("media:write");
    const rows = await prisma.mediaAsset.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return {
      ok: true,
      assets: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        url: r.url,
        name: r.name,
        source: r.source,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load media" };
  }
}

const urlSchema = z.object({
  url: z.string().url().max(2000),
  name: z.string().max(120).optional(),
  kind: z.enum(["image", "video"]).optional(),
});

export async function addMediaByUrl(input: z.input<typeof urlSchema>): Promise<Result> {
  try {
    const session = await requirePermission("media:write");
    const d = urlSchema.parse(input);
    const kind = d.kind ?? (VIDEO_EXT.test(d.url) ? "video" : "image");
    const name = d.name?.trim() || d.url.split("/").pop()?.split("?")[0] || "asset";

    await prisma.mediaAsset.create({
      data: {
        kind,
        url: d.url,
        name,
        source: "url",
        createdById: session.user.id,
        createdBy: session.user.email,
      },
    });
    await logAudit({ action: "media.add", target: name, meta: { kind, source: "url" } });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add the URL" };
  }
}

export async function deleteMedia(id: string): Promise<Result> {
  try {
    await requirePermission("media:write");
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return { ok: false, error: "Not found" };

    if (asset.source === "uploaded" && asset.url.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", asset.url.replace(/^\//, "")));
      } catch {
        /* file already gone — fine */
      }
    }
    await prisma.mediaAsset.delete({ where: { id } });
    await logAudit({ action: "media.delete", target: asset.name });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete" };
  }
}
