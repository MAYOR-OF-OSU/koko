import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO = 64 * 1024 * 1024; // 64 MB

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

export async function POST(req: Request) {
  let session;
  try {
    session = await requirePermission("media:write");
  } catch {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: `Unsupported type: ${file.type || "unknown"}` },
      { status: 415 },
    );
  }
  const kind = file.type.startsWith("video/") ? "video" : "image";
  const cap = kind === "video" ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > cap) {
    return NextResponse.json(
      { ok: false, error: `${kind === "video" ? "Video" : "Image"} exceeds ${Math.round(cap / 1024 / 1024)} MB` },
      { status: 413 },
    );
  }

  const id = randomUUID();
  const filename = `${id}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ ok: false, error: "Could not write the file" }, { status: 500 });
  }

  const url = `/uploads/${filename}`;
  const name = (form.get("name") as string)?.trim() || file.name || filename;

  const asset = await prisma.mediaAsset.create({
    data: {
      kind,
      url,
      name,
      mime: file.type,
      sizeBytes: file.size,
      source: "uploaded",
      createdById: session.user.id,
      createdBy: session.user.email,
    },
  });

  await logAudit({ action: "media.upload", target: name, meta: { kind, sizeBytes: file.size } });
  revalidatePath("/admin/media");

  return NextResponse.json({ ok: true, asset });
}
