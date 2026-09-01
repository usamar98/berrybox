import { ApiError, createFalClient } from "@fal-ai/client";

const DEFAULT_TEMPLATE_MODEL = "fal-ai/hunyuan3d-v3/text-to-3d";
const DEFAULT_CHARACTER_MODEL = "meshy/v7/text-to-3d";
const MODEL_ID = /^(?:[a-z0-9][a-z0-9._-]*\/){1,5}[a-z0-9][a-z0-9._-]*$/i;
const HTTP_URL = /^https?:\/\//i;
const MAX_MODELS_PER_FEATURE = 12;

export type FalTask = {
  taskId: string;
  model: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
};

export type CharacterGenerationOptions = {
  poseMode: "a-pose" | "t-pose";
  modelType: "standard" | "lowpoly";
  heightMeters: number;
  animate: boolean;
};

export type FalCharacterTask = FalTask & {
  rigged: boolean;
  animated: boolean;
  riggedModelUrl?: string;
  animationUrl?: string;
  fbxUrl?: string;
};

export class FalProviderError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "FalProviderError";
  }
}

function parseModels(value: string | undefined) {
  const models = (value || "")
    .split(",")
    .map((model) => model.trim())
    .filter((model) => MODEL_ID.test(model));
  return [...new Set(models)].slice(0, MAX_MODELS_PER_FEATURE);
}

export function configuredTemplateModels() {
  const configured = parseModels(process.env.FAL_3D_TEMPLATE_MODELS);
  return configured.length ? configured : [DEFAULT_TEMPLATE_MODEL];
}

export function configuredCharacterModels() {
  const configured = parseModels(process.env.FAL_3D_CHARACTER_MODELS);
  return configured.length ? configured : [DEFAULT_CHARACTER_MODEL];
}

export function configuredGameModels() {
  return parseModels(process.env.FAL_3D_GAME_MODELS);
}

export function templateGenerationAvailable() {
  return Boolean(process.env.FAL_KEY)
    && process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION === "true"
    && configuredTemplateModels().length > 0;
}

export function characterGenerationAvailable() {
  return Boolean(process.env.FAL_KEY)
    && process.env.BERRYBOX_ENABLE_3D_CHARACTER_GENERATION === "true"
    && configuredCharacterModels().length > 0;
}

export function resolveTemplateModel(requested?: string) {
  const models = configuredTemplateModels();
  if (!requested) return models[0];
  return models.includes(requested) ? requested : undefined;
}

export function resolveCharacterModel(requested?: string) {
  const models = configuredCharacterModels();
  if (!requested) return models[0];
  return models.includes(requested) ? requested : undefined;
}

export function modelLabel(model: string) {
  const path = model.replace(/\/text-to-3d$/i, "").split("/");
  return path.slice(-2).join(" · ").replaceAll("-", " ");
}

function client() {
  return createFalClient({ credentials: () => process.env.FAL_KEY });
}

function providerMessage(status: number) {
  if (status === 401 || status === 403) return "The fal API key is invalid or does not have access.";
  if (status === 402) return "The fal account needs additional credits.";
  if (status === 422) return "The selected fal model rejected this prompt or input configuration.";
  if (status === 429) return "fal is rate-limiting generation. Wait a moment and try again.";
  return "fal could not complete the 3D request.";
}

function normalizeError(error: unknown) {
  if (error instanceof FalProviderError) return error;
  if (error instanceof ApiError) return new FalProviderError(error.status, providerMessage(error.status));
  if (error instanceof Error && error.name === "AbortError") return new FalProviderError(504, "The fal request timed out.");
  return new FalProviderError(502, "fal could not complete the 3D request.");
}

function readPath(value: unknown, path: string[]) {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function fileUrl(value: unknown, extension?: RegExp) {
  const candidate = typeof value === "string"
    ? value
    : value && typeof value === "object"
      ? (value as Record<string, unknown>).url
      : undefined;
  return typeof candidate === "string" && HTTP_URL.test(candidate) && (!extension || extension.test(candidate))
    ? candidate
    : undefined;
}

function findUrl(value: unknown, extension: RegExp, depth = 0): string | undefined {
  const direct = fileUrl(value, extension);
  if (direct) return direct;
  if (!value || typeof value !== "object" || depth >= 5) return undefined;
  for (const child of Object.values(value as Record<string, unknown>)) {
    const found = findUrl(child, extension, depth + 1);
    if (found) return found;
  }
  return undefined;
}

function extractModelUrl(data: unknown) {
  const preferredPaths = [
    ["model_glb"],
    ["model_urls", "glb"],
    ["model_urls", "pbr_model"],
    ["model_mesh"],
    ["rigged_character_glb"],
    ["output", "model_url"],
    ["model_file"],
  ];
  for (const path of preferredPaths) {
    const found = fileUrl(readPath(data, path), /\.glb(?:$|\?)/i);
    if (found) return found;
  }
  return findUrl(data, /\.glb(?:$|\?)/i);
}

function extractThumbnailUrl(data: unknown) {
  const preferredPaths = [["thumbnail"], ["rendered_image"], ["preview"], ["thumbnail_url"], ["rendered_image_url"]];
  for (const path of preferredPaths) {
    const found = fileUrl(readPath(data, path), /\.(?:png|jpe?g|webp)(?:$|\?)/i);
    if (found) return found;
  }
  return findUrl(data, /\.(?:png|jpe?g|webp)(?:$|\?)/i);
}

function preferredGlb(data: unknown, path: string[]) {
  return fileUrl(readPath(data, path), /\.glb(?:$|\?)/i);
}

function extractCharacterOutput(data: unknown) {
  const animationUrl = preferredGlb(data, ["animation_glb"]);
  const riggedModelUrl = preferredGlb(data, ["rigged_character_glb"]);
  const modelUrl = animationUrl || riggedModelUrl || extractModelUrl(data);
  const fbxUrl = fileUrl(readPath(data, ["animation_fbx"]), /\.fbx(?:$|\?)/i)
    || fileUrl(readPath(data, ["rigged_character_fbx"]), /\.fbx(?:$|\?)/i);
  return { modelUrl, animationUrl, riggedModelUrl, fbxUrl };
}

function progressFromLogs(logs: Array<{ message: string }> | undefined) {
  if (!logs?.length) return 45;
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const match = logs[index].message.match(/(?:^|\s)(\d{1,3})%/);
    if (match) return Math.min(95, Math.max(5, Number(match[1])));
  }
  return 45;
}

export async function createTemplateTask(prompt: string, model: string, signal?: AbortSignal) {
  if (!resolveTemplateModel(model)) throw new FalProviderError(400, "The selected fal model is not enabled for this deployment.");
  try {
    const queued = await client().queue.submit(model, {
      input: { prompt },
      abortSignal: signal,
    });
    return queued.request_id;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getTemplateTask(taskId: string, model: string, signal?: AbortSignal): Promise<FalTask> {
  if (!resolveTemplateModel(model)) throw new FalProviderError(400, "The selected fal model is not enabled for this deployment.");
  try {
    const falClient = client();
    const status = await falClient.queue.status(model, { requestId: taskId, logs: true, abortSignal: signal });
    if (status.status === "COMPLETED") {
      const result = await falClient.queue.result(model, { requestId: taskId, abortSignal: signal });
      const modelUrl = extractModelUrl(result.data);
      if (!modelUrl) throw new FalProviderError(502, "The selected fal model completed without a GLB output.");
      return { taskId, model, status: "SUCCEEDED", progress: 100, modelUrl, thumbnailUrl: extractThumbnailUrl(result.data) };
    }
    if (status.status === "IN_QUEUE") return { taskId, model, status: "PENDING", progress: 5 };
    return { taskId, model, status: "IN_PROGRESS", progress: progressFromLogs(status.logs) };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function createCharacterTask(
  prompt: string,
  model: string,
  options: CharacterGenerationOptions,
  signal?: AbortSignal,
) {
  if (!resolveCharacterModel(model)) throw new FalProviderError(400, "The selected fal character model is not enabled for this deployment.");
  const input = model === DEFAULT_CHARACTER_MODEL
    ? {
        prompt,
        mode: "full",
        model_type: options.modelType,
        topology: "quad",
        target_polycount: 24_000,
        should_remesh: true,
        symmetry_mode: "auto",
        enable_pbr: true,
        pose_mode: options.poseMode,
        enable_prompt_expansion: true,
        enable_rigging: true,
        rigging_height_meters: options.heightMeters,
        enable_animation: options.animate,
        animation_action_id: 0,
        enable_safety_checker: true,
      }
    : { prompt };

  try {
    const queued = await client().queue.submit(model, { input, abortSignal: signal });
    return queued.request_id;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getCharacterTask(taskId: string, model: string, signal?: AbortSignal): Promise<FalCharacterTask> {
  if (!resolveCharacterModel(model)) throw new FalProviderError(400, "The selected fal character model is not enabled for this deployment.");
  try {
    const falClient = client();
    const status = await falClient.queue.status(model, { requestId: taskId, logs: true, abortSignal: signal });
    if (status.status === "COMPLETED") {
      const result = await falClient.queue.result(model, { requestId: taskId, abortSignal: signal });
      const output = extractCharacterOutput(result.data);
      if (!output.modelUrl) throw new FalProviderError(502, "The selected fal character model completed without a GLB output.");
      return {
        taskId,
        model,
        status: "SUCCEEDED",
        progress: 100,
        thumbnailUrl: extractThumbnailUrl(result.data),
        rigged: Boolean(output.riggedModelUrl),
        animated: Boolean(output.animationUrl),
        ...output,
      };
    }
    if (status.status === "IN_QUEUE") {
      return { taskId, model, status: "PENDING", progress: 5, rigged: false, animated: false };
    }
    return { taskId, model, status: "IN_PROGRESS", progress: progressFromLogs(status.logs), rigged: false, animated: false };
  } catch (error) {
    throw normalizeError(error);
  }
}
