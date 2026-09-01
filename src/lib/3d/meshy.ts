import { z } from "zod";

const MESHY_BASE_URL = "https://api.meshy.ai/openapi/v2/text-to-3d";

const CreateTaskResponseSchema = z.object({ result: z.string().min(8).max(120) });
const TaskResponseSchema = z.object({
  id: z.string().min(8).max(120),
  status: z.string(),
  progress: z.number().min(0).max(100).optional(),
  model_urls: z.object({ glb: z.string().url().optional() }).passthrough().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  task_error: z.object({ message: z.string().optional() }).optional().nullable(),
});

export type MeshyTask = {
  taskId: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
};

export class MeshyProviderError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "MeshyProviderError";
  }
}

export function templateGenerationAvailable() {
  return Boolean(process.env.MESHY_API_KEY) && process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION === "true";
}

async function meshyFetch(path: string, init: RequestInit, requestSignal?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  const abort = () => controller.abort();
  requestSignal?.addEventListener("abort", abort, { once: true });

  try {
    return await fetch(`${MESHY_BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
    requestSignal?.removeEventListener("abort", abort);
  }
}

function providerMessage(status: number) {
  if (status === 401 || status === 403) return "The Meshy API key is invalid or does not have access.";
  if (status === 402) return "The Meshy account needs additional generation credits.";
  if (status === 429) return "Meshy is rate-limiting generation. Wait a moment and try again.";
  return "Meshy could not complete the 3D request.";
}

export async function createTemplateTask(prompt: string, signal?: AbortSignal) {
  const response = await meshyFetch("", {
    method: "POST",
    body: JSON.stringify({
      mode: "preview",
      prompt,
      should_remesh: true,
      target_polycount: 30_000,
      target_formats: ["glb"],
    }),
  }, signal);

  if (!response.ok) throw new MeshyProviderError(response.status, providerMessage(response.status));
  const parsed = CreateTaskResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new MeshyProviderError(502, "Meshy returned an unexpected task response.");
  return parsed.data.result;
}

export async function getTemplateTask(taskId: string, signal?: AbortSignal): Promise<MeshyTask> {
  const response = await meshyFetch(`/${encodeURIComponent(taskId)}`, { method: "GET" }, signal);
  if (!response.ok) throw new MeshyProviderError(response.status, providerMessage(response.status));
  const parsed = TaskResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new MeshyProviderError(502, "Meshy returned an unexpected task status.");

  const knownStatus = ["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "CANCELED"].includes(parsed.data.status)
    ? parsed.data.status as MeshyTask["status"]
    : "IN_PROGRESS";

  return {
    taskId: parsed.data.id,
    status: knownStatus,
    progress: parsed.data.progress ?? 0,
    modelUrl: parsed.data.model_urls?.glb,
    thumbnailUrl: parsed.data.thumbnail_url ?? undefined,
  };
}
