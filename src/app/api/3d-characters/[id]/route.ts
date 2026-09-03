import { deleteCharacterJob, getCharacterJob } from "@/lib/3d-characters/store";
import { toPublicCharacter } from "@/lib/3d-characters/types";
import { processOwnedCharacterJob } from "@/lib/3d-characters/workflow";
import { deleteMeshyTask } from "@/lib/3d-scenes/meshy";
import { sameOrigin, sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { deleteSceneAssets } from "@/lib/3d-scenes/storage";

export const runtime = "nodejs";
export const maxDuration = 300;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid character ID." }, { status: 400, headers: withOwnerCookie(undefined, owner.setCookie) });
  try {
    const job = await getCharacterJob(id, owner.ownerId);
    if (!job) return Response.json({ error: "Character not found." }, { status: 404, headers: withOwnerCookie(undefined, owner.setCookie) });
    return Response.json({ character: toPublicCharacter(job) }, { headers: withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie) });
  } catch {
    return Response.json({ error: "Character status is temporarily unavailable." }, { status: 503, headers: withOwnerCookie(undefined, owner.setCookie) });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const headers = withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie);
  const { id } = await params;
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  if (!UUID.test(id)) return Response.json({ error: "Invalid character ID." }, { status: 400, headers });
  try {
    const existing = await getCharacterJob(id, owner.ownerId);
    if (!existing) return Response.json({ error: "Character not found." }, { status: 404, headers });
    if (["queued", "processing"].includes(existing.status)) await processOwnedCharacterJob(id, owner.ownerId);
    const job = await getCharacterJob(id, owner.ownerId);
    if (!job) return Response.json({ error: "Character not found." }, { status: 404, headers });
    return Response.json({ character: toPublicCharacter(job) }, { headers });
  } catch {
    return Response.json({ error: "Character processing is temporarily unavailable." }, { status: 503, headers });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = sceneOwner(request);
  const headers = withOwnerCookie(undefined, owner.setCookie);
  const { id } = await params;
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  if (!UUID.test(id)) return Response.json({ error: "Invalid character ID." }, { status: 400, headers });
  try {
    const job = await getCharacterJob(id, owner.ownerId);
    if (!job) return Response.json({ error: "Character not found." }, { status: 404, headers });
    if (!["ready", "failed", "canceled", "review_required"].includes(job.status)) {
      return Response.json({ error: "Only completed or failed characters can be deleted." }, { status: 409, headers });
    }
    await deleteSceneAssets([job.modelBlobPath, job.thumbnailBlobPath]);
    await deleteCharacterJob(id, owner.ownerId);
    await Promise.all([job.geometryTaskId, job.textureTaskId].filter((task): task is string => Boolean(task)).map(deleteMeshyTask));
    return new Response(null, { status: 204, headers });
  } catch {
    return Response.json({ error: "The character could not be deleted." }, { status: 502, headers });
  }
}
