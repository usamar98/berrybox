import { sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { readSceneAsset } from "@/lib/3d-scenes/storage";
import { getSceneJob } from "@/lib/3d-scenes/store";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  const job = await getSceneJob(id, owner.ownerId).catch(() => undefined);
  if (!job?.thumbnailBlobPath) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const asset = await readSceneAsset(job.thumbnailBlobPath).catch(() => undefined);
  if (!asset) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const headers = withOwnerCookie({
    "Content-Type": job.thumbnailMime || asset.contentType || "image/png",
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
  }, owner.setCookie);
  if (asset.size > 0) headers.set("Content-Length", String(asset.size));
  return new Response(asset.stream, {
    headers,
  });
}
