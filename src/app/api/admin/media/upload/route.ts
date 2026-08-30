import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requirePermission } from "@/lib/admin-guard";
import { features } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
];

/** Capability probe — the client asks whether direct-to-Blob uploads are available. */
export async function GET() {
  try {
    await requirePermission("media:write");
  } catch {
    return NextResponse.json({ blob: false }, { status: 403 });
  }
  return NextResponse.json({ blob: features.blob });
}

/** Token endpoint for `@vercel/blob/client`'s `upload()` — files stream straight to Blob. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requirePermission("media:write"); // throws → 400 below
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: 64 * 1024 * 1024, // 64 MB (covers short videos)
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client calls `registerMedia` after `upload()` resolves.
        // (Vercel can't reach localhost for this callback anyway.)
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
