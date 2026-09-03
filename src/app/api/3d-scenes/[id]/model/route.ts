import { sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { readSceneAsset } from "@/lib/3d-scenes/storage";
import { getSceneJob } from "@/lib/3d-scenes/store";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  const job = await getSceneJob(id, owner.ownerId).catch(() => undefined);
  if (!job?.modelBlobPath || job.status !== "ready") return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const requestedRange = request.headers.get("range")?.trim();
  const range = requestedRange && /^bytes=\d*-\d*$/.test(requestedRange) ? requestedRange : undefined;
  const asset = await readSceneAsset(job.modelBlobPath, range).catch(() => undefined);
  if (!asset) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const headers = withOwnerCookie({
    "Content-Type": "model/gltf-binary",
    "Content-Length": String(asset.size),
    "Cache-Control": "private, max-age=300",
    "Content-Disposition": `inline; filename="berrybox-scene-${job.id.slice(0, 8)}.glb"`,
    "Accept-Ranges": asset.acceptRanges || "bytes",
  }, owner.setCookie);
  if (asset.contentRange) headers.set("Content-Range", asset.contentRange);
  if (asset.etag) headers.set("ETag", asset.etag);
  return new Response(asset.stream, {
    status: asset.contentRange ? 206 : 200,
    headers,
  });
}
