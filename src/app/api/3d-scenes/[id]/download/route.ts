import { sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { readSceneAsset } from "@/lib/3d-scenes/storage";
import { getSceneJob } from "@/lib/3d-scenes/store";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  const job = await getSceneJob(id, owner.ownerId).catch(() => undefined);
  if (!job?.modelBlobPath || job.status !== "ready") return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const asset = await readSceneAsset(job.modelBlobPath).catch(() => undefined);
  if (!asset) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  return new Response(asset.stream, {
    headers: withOwnerCookie({
      "Content-Type": "model/gltf-binary",
      "Content-Length": String(asset.size),
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="berrybox-scene-${job.id.slice(0, 8)}.glb"`,
    }, owner.setCookie),
  });
}
