import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { GameConfigSchema } from "./config";

const InputSchema = z.object({
  prompt: z.string().trim().min(3).max(500),
  config: GameConfigSchema,
});
const OutputSchema = z.object({
  config: GameConfigSchema,
  message: z.string().min(1).max(500),
});
const instruction = [
  "You edit supported settings for BerryBox's small 3D game templates.",
  "Return a complete valid configuration and a brief, truthful explanation.",
  "Preserve unrelated fields. Keep the existing template unless the user explicitly asks to switch.",
  "Explorer: collect all crystals in an arena. Runner: jump barriers, collect crystals, reach the portal.",
  "Supported: title, forest/neon/desert theme, mint/rose/violet/gold player color,",
  "moveSpeed 3-10, health 1-5, collectibleCount 3-12, enemyCount 0-6,",
  "enemySpeed 0.5-3, patrol/chase/guard behavior, timeLimit 30-180 seconds.",
  "Map synonyms sensibly. If a requested feature is unsupported, explain that limit and do not pretend to implement it.",
  "No character generation, new mechanics, arbitrary code, multiplayer, publishing, or external assets.",
  "Do not output HTML, scripts, links, secrets, or offensive titles.",
].join(" ");

// Conservative single-instance alpha guard, not a distributed production quota.
let minuteStart = Date.now();
let calls = 0;
let inFlight = 0;

export function aiAvailable() {
  const productionAllowed = process.env.NODE_ENV !== "production" || process.env.BERRYBOX_ENABLE_ALPHA_AI === "true";
  return Boolean(process.env.OPENAI_API_KEY) && productionAllowed;
}

export async function GET() {
  return Response.json({
    available: aiAvailable(),
    message: aiAvailable()
      ? "AI edits are configured. Requests depend on provider availability and credits."
      : "AI is not enabled on this server. Templates and manual editing still work.",
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Send a JSON game request." }, { status: 415 });
  }
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    const decoder = new TextDecoder();
    let content = "";
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return Response.json({ error: "Game request is too large." }, { status: 413 });
      }
      content += decoder.decode(value, { stream: true });
    }
    content += decoder.decode();
    body = JSON.parse(content);
  } catch {
    return Response.json({ error: "The game request is not valid JSON." }, { status: 400 });
  }
  const input = InputSchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: "Use a valid game configuration and a prompt between 3 and 500 characters." }, { status: 400 });
  }
  if (!aiAvailable()) {
    return Response.json({ error: "AI is not enabled on this server. You can still play templates and use manual settings." }, { status: 503 });
  }
  if (Date.now() - minuteStart >= 60_000) { minuteStart = Date.now(); calls = 0; }
  if (calls >= 12 || inFlight >= 2) {
    return Response.json({ error: "The alpha builder is busy. Please wait a minute before trying again." }, { status: 429, headers: { "Retry-After": "60" } });
  }
  calls++;
  inFlight++;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 40_000, maxRetries: 0 });
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      store: false,
      input: [
        { role: "system", content: instruction },
        { role: "user", content: JSON.stringify(input.data) },
      ],
      text: { format: zodTextFormat(OutputSchema, "berrybox_game_edit") },
      max_output_tokens: 1800,
    }, { signal: request.signal });
    const result = OutputSchema.safeParse(response.output_parsed);
    if (!result.success) {
      return Response.json({ error: "AI did not return a usable game edit. Your project is unchanged." }, { status: 502 });
    }
    return Response.json({ ...result.data, source: "openai" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // Never expose prompts, credentials, raw provider messages, or server configuration.
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    const code = error instanceof OpenAI.APIError ? error.code : undefined;
    console.error("Game edit request failed", { status, code });
    if (code === "credit_balance_exhausted" || code === "insufficient_quota") {
      return Response.json({ error: "OpenAI API credits are exhausted or the billing quota has been reached. The server owner needs to check API billing. Your game is unchanged; manual settings still work." }, { status: 429 });
    }
    if (status === 429) {
      return Response.json({ error: "OpenAI is temporarily rate-limiting requests. No changes were applied. Wait a minute before trying again." }, { status: 429, headers: { "Retry-After": "60" } });
    }
    if (status === 401 || status === 403 || status === 404) {
      return Response.json({ error: "The server's AI configuration needs attention. No changes were applied. Manual editing is available." }, { status: 503 });
    }
    return Response.json({ error: "AI couldn't complete this edit. Your project is unchanged. Please retry or use manual settings." }, { status: 502 });
  } finally {
    inFlight--;
  }
}
