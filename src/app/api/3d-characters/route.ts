import { z } from "zod";
import { characterConfig, characterGenerationAvailable, missingCharacterConfiguration } from "@/lib/3d-characters/config";
import { buildCharacterPrompt, CHARACTER_PROMPT_MAX } from "@/lib/3d-characters/prompt";
import { createCharacterJob, listCharacterJobs, CharacterStoreError } from "@/lib/3d-characters/store";
import { CHARACTER_BODY_PLANS, CHARACTER_POSES, CHARACTER_STYLES, toPublicCharacter, type CharacterSettings } from "@/lib/3d-characters/types";
import { sameOrigin, sceneOwner, withOwnerCookie } from "@/lib/3d-scenes/owner";

export const runtime = "nodejs";
export const maxDuration = 60;

const InputSchema = z.object({
  prompt: z.string().trim().min(12).max(CHARACTER_PROMPT_MAX),
  submissionKey: z.string().uuid(),
  style: z.enum(CHARACTER_STYLES),
  bodyPlan: z.enum(CHARACTER_BODY_PLANS),
  pose: z.enum(CHARACTER_POSES),
});
const MAX_BODY_BYTES = 4096;

function logCharacterApiError(operation: string, error: unknown) {
  const value = error as { name?: unknown; message?: unknown; code?: unknown };
  const message = typeof value?.message === "string"
    ? value.message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[database-url]").slice(0, 500)
    : "Unknown character API error";
  console.error(`[3d-characters:${operation}]`, {
    name: typeof value?.name === "string" ? value.name : "UnknownError",
    message,
    code: typeof value?.code === "string" ? value.code : undefined,
  });
}

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
      throw new RangeError("Character request is too large.");
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
  const available = characterGenerationAvailable();
  try {
    const history = available ? await listCharacterJobs(owner.ownerId, page, pageSize) : { jobs: [], total: 0 };
    return Response.json({
      available,
      provider: "Meshy",
      output: "Textured static GLB",
      model: characterConfig().model,
      quota: characterConfig().dailyQuota,
      missingConfiguration: missingCharacterConfiguration(),
      items: history.jobs.map(toPublicCharacter),
      pagination: { page, pageSize, total: history.total, pages: Math.max(1, Math.ceil(history.total / pageSize)) },
    }, { headers: withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie) });
  } catch (error) {
    logCharacterApiError("history", error);
    return Response.json({ error: "Character history is temporarily unavailable." }, { status: 503, headers: withOwnerCookie(undefined, owner.setCookie) });
  }
}

export async function POST(request: Request) {
  const owner = sceneOwner(request);
  const headers = withOwnerCookie({ "Cache-Control": "no-store" }, owner.setCookie);
  if (!sameOrigin(request)) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Send a JSON character request." }, { status: 415, headers });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ error: "Character request is too large." }, { status: 413, headers });
  if (!characterGenerationAvailable()) {
    return Response.json({ error: `Character generation is not configured. Missing: ${missingCharacterConfiguration().join(", ")}.` }, { status: 503, headers });
  }

  let body: unknown;
  try {
    body = await readLimitedJson(request);
  } catch (error) {
    return Response.json({ error: error instanceof RangeError ? error.message : "The character request is not valid JSON." }, { status: error instanceof RangeError ? 413 : 400, headers });
  }
  const input = InputSchema.safeParse(body);
  if (!input.success) return Response.json({ error: `Describe one character in 12 to ${CHARACTER_PROMPT_MAX} characters and select valid generation options.` }, { status: 400, headers });

  const submittedPrompt = buildCharacterPrompt(input.data);
  if (submittedPrompt.length > 800) return Response.json({ error: "The complete character direction is too long. Shorten the description." }, { status: 400, headers });

  try {
    const config = characterConfig();
    const settings: CharacterSettings = {
      style: input.data.style,
      bodyPlan: input.data.bodyPlan,
      pose: input.data.pose,
      modelType: "standard",
      topology: "triangle",
      targetPolycount: 30_000,
      textureResolution: "2k",
      enablePbr: true,
      targetFormats: ["glb"],
    };
    const job = await createCharacterJob({
      ownerId: owner.ownerId,
      originalPrompt: input.data.prompt,
      submittedPrompt,
      model: config.model,
      submissionKey: input.data.submissionKey,
      settings,
    });
    return Response.json({ character: toPublicCharacter(job) }, { status: 202, headers });
  } catch (error) {
    if (error instanceof CharacterStoreError) {
      const status = error.code === "quota" || error.code === "busy" ? 429 : 503;
      return Response.json({ error: error.message }, { status, headers: status === 429 ? withOwnerCookie({ "Retry-After": "60" }, owner.setCookie) : headers });
    }
    logCharacterApiError("create", error);
    return Response.json({ error: "The character job could not be created." }, { status: 503, headers });
  }
}
