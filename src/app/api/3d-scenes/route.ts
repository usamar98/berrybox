import { z } from "zod";
import { missingSceneConfiguration, sceneConfig, sceneGenerationAvailable } from "@/lib/3d-scenes/config";
import { sameOrigin, sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";
import { createSceneJob, listSceneJobs, SceneStoreError } from "@/lib/3d-scenes/store";
import { toPublicScene } from "@/lib/3d-scenes/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const InputSchema = z.object({
  prompt: z.string().trim().min(12).max(600),
  submissionKey: z.string().uuid(),
});
const MAX_BODY_BYTES = 4096;

async function readLimitedJson(request: Request) {
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("Scene request is too large.");
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  return JSON.parse(raw);
}

export async function GET(request: Request) {
  const owner = sceneOwner(request);
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(10_000, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const pageSize = 6;
  const available = sceneGenerationAvailable();
  try {
    const history = available ? await listSceneJobs(owner.ownerId, page, pageSize) : { jobs: [], total: 0 };
    return Response.json({
      available,
      provider: "Meshy",
      output: "Textured GLB",
      model: sceneConfig().model,
      quota: sceneConfig().dailyQuota,
      missingConfiguration: missingSceneConfiguration(),
      items: history.jobs.map(toPublicScene),
      pagination: { page, pageSize, total: history.total, pages: Math.max(1, Math.ceil(history.total / pageSize)) },
    }, { headers: withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie) });
  } catch {
    return Response.json({ error: "Scene history is temporarily unavailable." }, { status: 503, headers: withOwnerCookie(undefined, owner.setCookie) });
  }
}

export async function POST(request: Request) {
  const owner = sceneOwner(request);
  const headers = withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie);
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Send a JSON scene request." }, { status: 415, headers });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ error: "Scene request is too large." }, { status: 413, headers });
  if (!sceneGenerationAvailable()) {
    return Response.json({ error: `Scene generation is not configured. Missing: ${missingSceneConfiguration().join(", ")}.` }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    return Response.json({ error: error instanceof RangeError ? error.message : "The scene request is not valid JSON." }, { status: error instanceof RangeError ? 413 : 400, headers });
  }
  const input = InputSchema.safeParse(body);
  if (!input.success) return Response.json({ error: "Describe one small 3D scene in 12 to 600 characters." }, { status: 400, headers });

  try {
    const config = sceneConfig();
    const job = await createSceneJob({
      ownerId: owner.ownerId,
      prompt: input.data.prompt,
      model: config.model,
      submissionKey: input.data.submissionKey,
      settings: { modelType: "standard", topology: "triangle", targetPolycount: 30_000, textureResolution: "2k", enablePbr: true, targetFormats: ["glb"] },
    });
    return Response.json({ scene: toPublicScene(job) }, { status: 202, headers });
  } catch (error) {
    if (error instanceof SceneStoreError) {
      const status = error.code === "quota" || error.code === "busy" ? 429 : 503;
      return Response.json({ error: error.message }, { status, headers: status === 429 ? withOwnerCookie({ "Retry-After": "60" }, owner.setCookie) : headers });
    }
    return Response.json({ error: "The scene job could not be created." }, { status: 503, headers });
  }
}
