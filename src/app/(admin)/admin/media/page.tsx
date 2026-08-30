import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/media-library";
import type { MediaAssetLite } from "@/server/actions/media";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await guardPage("media:write");

  let assets: MediaAssetLite[] = [];
  try {
    const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    assets = rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      url: r.url,
      name: r.name,
      source: r.source,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return (
      <AdminPage title="Media library">
        <DbDown area="The media library" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Media library"
      description="Every image and video for the storefront — upload files or point at a URL."
    >
      <MediaLibrary assets={assets} />
    </AdminPage>
  );
}
