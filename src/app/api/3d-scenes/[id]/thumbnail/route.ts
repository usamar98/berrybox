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
  return new Response(asset.stream, {
    headers: withOwnerCookie({
      "Content-Type": job.thumbnailMime || asset.contentType || "image/png",
      "Content-Length": String(asset.size),
      "Cache-Control": "private, max-age=300",
    }, owner.setCookie),
  });
}
