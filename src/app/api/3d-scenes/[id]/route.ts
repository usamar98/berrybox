import { deleteMeshyTask } from "@/lib/3d-scenes/meshy";
import { sameOrigin, sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { deleteSceneAssets } from "@/lib/3d-scenes/storage";
import { deleteSceneJob, getSceneJob } from "@/lib/3d-scenes/store";
import { toPublicScene } from "@/lib/3d-scenes/types";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid scene ID." }, { status: 400, headers: withOwnerCookie(undefined, owner.setCookie) });
  try {
    const job = await getSceneJob(id, owner.ownerId);
    if (!job) return Response.json({ error: "Scene not found." }, { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
    return Response.json({ scene: toPublicScene(job) }, { headers: withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie) });
  } catch {
    return Response.json({ error: "Scene status is temporarily unavailable." }, { status: 503, headers: withOwnerCookie(undefined, owner.setCookie) });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const headers = withOwnerCookie(undefined, owner.setCookie);
  const { id } = await params;
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  if (!UUID.test(id)) return Response.json({ error: "Invalid scene ID." }, { status: 400, headers });
  try {
    const job = await getSceneJob(id, owner.ownerId);
    if (!job) return Response.json({ error: "Scene not found." }, { status: 404, headers });
    if (!["ready", "failed", "canceled", "review_required"].includes(job.status)) {
      return Response.json({ error: "Only completed or failed scenes can be deleted." }, { status: 409, headers });
    }
    await deleteSceneAssets([job.modelBlobPath, job.thumbnailBlobPath]);
    await deleteSceneJob(id, owner.ownerId);
    await Promise.all([job.geometryTaskId, job.textureTaskId].filter((task): task is string => Boolean(task)).map(deleteMeshyTask));
    return new Response(null, { status: 204, headers });
  } catch {
    return Response.json({ error: "The scene could not be deleted." }, { status: 502, headers });
  }
}
