import { processSceneBatch } from "@/lib/3d-scenes/workflow";
import { processCharacterBatch } from "@/lib/3d-characters/workflow";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const scenes = await processSceneBatch();
    const characters = await processCharacterBatch();
    return Response.json({ results: { scenes, characters } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The 3D generation worker could not run." }, { status: 503 });
  }
}
