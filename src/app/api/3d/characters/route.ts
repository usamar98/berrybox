import { z } from "zod";
import {
  characterGenerationAvailable,
  configuredCharacterModels,
  createCharacterTask,
  FalProviderError,
  modelLabel,
  resolveCharacterModel,
} from "@/lib/3d/fal";

export const runtime = "nodejs";
export const maxDuration = 60;

const InputSchema = z.object({
  prompt: z.string().trim().min(12).max(600),
  model: z.string().trim().max(180).optional(),
  poseMode: z.enum(["a-pose", "t-pose"]).default("a-pose"),
  modelType: z.enum(["standard", "lowpoly"]).default("standard"),
  heightMeters: z.number().min(1.2).max(2.4).default(1.7),
  animate: z.boolean().default(true),
});
const MAX_BODY_BYTES = 4096;
let hourStart = Date.now();
let calls = 0;
let inFlight = 0;

async function readLimitedJson(request: Request) {
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let raw = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("Character request is too large.");
    }
    raw += decoder.decode(value, { stream: true });
  }

  raw += decoder.decode();
  return JSON.parse(raw);
}

export function GET() {
  const models = configuredCharacterModels();
  return Response.json({
    available: characterGenerationAvailable(),
    provider: "fal.ai",
    output: "Rigged GLB",
    defaultModel: models[0],
    models: models.map((id) => ({ id, label: modelLabel(id) })),
    message: characterGenerationAvailable()
      ? "Character generation, humanoid rigging, and animation output are ready. fal credits and model limits apply."
      : "Add FAL_KEY and set BERRYBOX_ENABLE_3D_CHARACTER_GENERATION=true in Vercel.",
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Send a JSON character request." }, { status: 415 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ error: "Character request is too large." }, { status: 413 });

  let body: unknown;
  try { body = await readLimitedJson(request); }
  catch (error) {
    if (error instanceof RangeError) return Response.json({ error: error.message }, { status: 413 });
    return Response.json({ error: "The character request is not valid JSON." }, { status: 400 });
  }

  const input = InputSchema.safeParse(body);
  if (!input.success) return Response.json({ error: "Describe one humanoid character in 12 to 600 characters and use supported generation options." }, { status: 400 });
  if (!characterGenerationAvailable()) return Response.json({ error: "Character generation is not configured. Add FAL_KEY, enable the feature, and redeploy." }, { status: 503 });
  const model = resolveCharacterModel(input.data.model);
  if (!model) return Response.json({ error: "The selected fal character model is not enabled for this deployment." }, { status: 400 });

  if (Date.now() - hourStart >= 3_600_000) { hourStart = Date.now(); calls = 0; }
  if (calls >= 4 || inFlight >= 1) return Response.json({ error: "The character generator is busy or has reached its temporary safety limit. Try again later." }, { status: 429, headers: { "Retry-After": "60" } });

  calls += 1;
  inFlight += 1;
  try {
    const taskId = await createCharacterTask(input.data.prompt, model, {
      poseMode: input.data.poseMode,
      modelType: input.data.modelType,
      heightMeters: input.data.heightMeters,
      animate: input.data.animate,
    }, request.signal);
    return Response.json({ taskId, model, status: "PENDING", provider: "fal.ai" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof FalProviderError) return Response.json({ error: error.message }, { status: error.status >= 400 && error.status < 600 ? error.status : 502 });
    console.error("3D character generation failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: "The 3D provider could not start this character task." }, { status: 502 });
  } finally {
    inFlight -= 1;
  }
}
