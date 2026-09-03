import { getCharacterJob } from "@/lib/3d-characters/store";
import { sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { readSceneAsset } from "@/lib/3d-scenes/storage";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  const job = await getCharacterJob(id, owner.ownerId).catch(() => undefined);
  if (!job?.modelBlobPath || job.status !== "ready") return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const requestedRange = request.headers.get("range")?.trim();
  const range = requestedRange && /^bytes=\d*-\d*$/.test(requestedRange) ? requestedRange : undefined;
  const asset = await readSceneAsset(job.modelBlobPath, range).catch(() => undefined);
  if (!asset) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const headers = withOwnerCookie({
    "Content-Type": "model/gltf-binary",
    "Cache-Control": "private, max-age=300",
    "Content-Disposition": `inline; filename="berrybox-character-${job.id.slice(0, 8)}.glb"`,
    "Accept-Ranges": asset.acceptRanges || "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-BerryBox-Model-Size": String(job.modelSizeBytes || asset.size || 0),
  }, owner.setCookie);
  if (asset.size > 0) headers.set("Content-Length", String(asset.size));
  if (asset.contentRange) headers.set("Content-Range", asset.contentRange);
  if (asset.etag) headers.set("ETag", asset.etag);
  return new Response(asset.stream, { status: asset.contentRange ? 206 : 200, headers });
}
