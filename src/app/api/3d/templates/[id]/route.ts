import { getTemplateTask, MeshyProviderError, templateGenerationAvailable } from "@/lib/3d/meshy";

export const runtime = "nodejs";
export const maxDuration = 60;

const TASK_ID = /^[a-zA-Z0-9-]{8,120}$/;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
  if (!TASK_ID.test(id)) return Response.json({ error: "Invalid 3D generation task." }, { status: 400 });
  if (!templateGenerationAvailable()) return Response.json({ error: "3D generation is not configured." }, { status: 503 });

  try {
    const task = await getTemplateTask(id, request.signal);
    return Response.json(task, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof MeshyProviderError) return Response.json({ error: error.message }, { status: error.status >= 400 && error.status < 600 ? error.status : 502 });
    console.error("3D template status failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: "The 3D task status is temporarily unavailable." }, { status: 502 });
  }
}
