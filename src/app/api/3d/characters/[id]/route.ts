import { characterGenerationAvailable, FalProviderError, getCharacterTask, resolveCharacterModel } from "@/lib/3d/fal";

export const runtime = "nodejs";
export const maxDuration = 60;

const TASK_ID = /^[a-zA-Z0-9_-]{8,160}$/;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  if (!TASK_ID.test(id)) return Response.json({ error: "Invalid character generation task." }, { status: 400 });
  if (!characterGenerationAvailable()) return Response.json({ error: "Character generation is not configured." }, { status: 503 });
  const model = resolveCharacterModel(new URL(request.url).searchParams.get("model") || undefined);
  if (!model) return Response.json({ error: "The selected fal character model is not enabled for this deployment." }, { status: 400 });

  try {
    const task = await getCharacterTask(id, model, request.signal);
    return Response.json(task, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof FalProviderError) return Response.json({ error: error.message }, { status: error.status >= 400 && error.status < 600 ? error.status : 502 });
    console.error("3D character status failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: "The character task status is temporarily unavailable." }, { status: 502 });
  }
}
