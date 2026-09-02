import { processSceneBatch } from "@/lib/3d-scenes/workflow";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    return Response.json({ results: await processSceneBatch() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The scene worker could not run." }, { status: 503 });
  }
}
