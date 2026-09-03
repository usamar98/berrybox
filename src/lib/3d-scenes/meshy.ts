import { z } from "zod";

const API_ROOT = "https://api.meshy.ai/openapi/v2/text-to-3d";
const CreateResponse = z.object({ result: z.string().min(1).max(300) });

// Meshy uses null and an empty string as placeholders while a task is still
// running. Normalize those values at the provider boundary so polling does not
// turn a healthy, paid task into a failed application job.
const OptionalUrl = z.preprocess(
  (value) => value === null || value === "" ? undefined : value,
  z.string().url().optional(),
);
const OptionalModelUrls = z.preprocess(
  (value) => value === null ? undefined : value,
  z.object({ glb: OptionalUrl }).passthrough().optional(),
);
const OptionalTaskError = z.preprocess(
  (value) => value === null ? undefined : value,
  z.object({ message: z.string().optional() }).passthrough().optional(),
);

const TaskResponse = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "CANCELED"]),
  progress: z.number().min(0).max(100).catch(0),
  model_urls: OptionalModelUrls,
  thumbnail_url: OptionalUrl,
  alpha_thumbnail_url: OptionalUrl,
  task_error: OptionalTaskError,
});

export type MeshyTask = z.infer<typeof TaskResponse>;

export class MeshyError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly ambiguous = false,
  ) {
    super(message);
    this.name = "MeshyError";
  }
}

function providerMessage(status: number) {
  if (status === 401 || status === 403) return "Meshy authentication failed. Check the server API key.";
  if (status === 402) return "The Meshy account does not have enough credits.";
  if (status === 429) return "Meshy is rate-limiting 3D generation. Try again later.";
  if (status >= 400 && status < 500) return "Meshy rejected the 3D generation request.";
  return "Meshy is temporarily unavailable.";
}

async function meshyRequest(path: string, init: RequestInit, paidSubmission = false) {
  const key = process.env.MESHY_API_KEY;
  if (!key) throw new MeshyError(503, "Meshy generation is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new MeshyError(response.status, providerMessage(response.status));
    return await response.json() as unknown;
  } catch (error) {
    if (error instanceof MeshyError) throw error;
    const ambiguous = paidSubmission;
    throw new MeshyError(ambiguous ? 409 : 502, ambiguous
      ? "Meshy did not confirm the paid submission. This job needs review and will not be submitted again automatically."
      : "Meshy status is temporarily unavailable.", ambiguous);
  } finally {
    clearTimeout(timeout);
  }
}

export type MeshyGenerationOptions = {
  alphaThumbnail?: boolean;
  autoSize?: boolean;
};

export async function createGeometryTask(prompt: string, model: string, options: MeshyGenerationOptions = {}) {
  const data = await meshyRequest("", {
    method: "POST",
    body: JSON.stringify({
      mode: "preview",
      prompt,
      model_type: "standard",
      ai_model: model,
      should_remesh: true,
      topology: "triangle",
      target_polycount: 30_000,
      target_formats: ["glb"],
      moderation: true,
      ...(options.alphaThumbnail ? { alpha_thumbnail: true } : {}),
      ...(options.autoSize ? { auto_size: true, origin_at: "bottom" } : {}),
    }),
  }, true);
  return CreateResponse.parse(data).result;
}

export async function createTextureTask(previewTaskId: string, model: string, options: MeshyGenerationOptions = {}) {
  const data = await meshyRequest("", {
    method: "POST",
    body: JSON.stringify({
      mode: "refine",
      preview_task_id: previewTaskId,
      ai_model: model,
      enable_pbr: true,
      texture_resolution: "2k",
      target_formats: ["glb"],
      moderation: true,
      ...(options.alphaThumbnail ? { alpha_thumbnail: true } : {}),
      ...(options.autoSize ? { auto_size: true, origin_at: "bottom" } : {}),
    }),
  }, true);
  return CreateResponse.parse(data).result;
}

export async function getMeshyTask(taskId: string) {
  const data = await meshyRequest(`/${encodeURIComponent(taskId)}`, { method: "GET" });
  return TaskResponse.parse(data);
}

export async function deleteMeshyTask(taskId: string) {
  try {
    await meshyRequest(`/${encodeURIComponent(taskId)}`, { method: "DELETE" });
  } catch {
    // Provider cleanup is best-effort after application-owned assets are removed.
  }
}
