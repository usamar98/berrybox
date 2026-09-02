import { z } from "zod";

const API_ROOT = "https://api.meshy.ai/openapi/v2/text-to-3d";
const CreateResponse = z.object({ result: z.string().min(1).max(300) });
const TaskResponse = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "CANCELED"]),
  progress: z.number().min(0).max(100).catch(0),
  model_urls: z.object({ glb: z.string().url().optional() }).optional(),
  thumbnail_url: z.string().url().optional(),
  task_error: z.object({ message: z.string().optional() }).optional(),
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
  if (status === 429) return "Meshy is rate-limiting scene generation. Try again later.";
  if (status >= 400 && status < 500) return "Meshy rejected the scene generation request.";
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

export async function createGeometryTask(prompt: string, model: string) {
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
    }),
  }, true);
  return CreateResponse.parse(data).result;
}

export async function createTextureTask(previewTaskId: string, model: string) {
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
