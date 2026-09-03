import { getCharacterJob } from "@/lib/3d-characters/store";
import { sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { readSceneAsset } from "@/lib/3d-scenes/storage";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  const job = await getCharacterJob(id, owner.ownerId).catch(() => undefined);
  if (!job?.modelBlobPath || job.status !== "ready") return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const asset = await readSceneAsset(job.modelBlobPath).catch(() => undefined);
  if (!asset) return new Response("Not found", { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
  const headers = withOwnerCookie({
    "Content-Type": "model/gltf-binary",
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="berrybox-character-${job.id.slice(0, 8)}.glb"`,
    "X-Content-Type-Options": "nosniff",
  }, owner.setCookie);
  if (asset.size > 0) headers.set("Content-Length", String(asset.size));
  return new Response(asset.stream, { headers });
}
