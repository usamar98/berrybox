import { templateGenerationAvailable } from "@/lib/3d/meshy";

export const runtime = "nodejs";

export function GET() {
  return Response.json({
    providers: [
      { feature: "3d-template", provider: "Meshy", configured: Boolean(process.env.MESHY_API_KEY), enabled: templateGenerationAvailable(), status: "available" },
      { feature: "3d-character", provider: "Tripo", configured: Boolean(process.env.TRIPO_API_KEY), enabled: false, status: "coming-soon" },
      { feature: "3d-game", provider: "OpenAI Responses", configured: Boolean(process.env.OPENAI_API_KEY), enabled: false, status: "coming-soon" },
      { feature: "source-video", provider: "Pexels", configured: Boolean(process.env.PEXELS_API_KEY), enabled: false, status: "source-link-only" },
    ],
  }, { headers: { "Cache-Control": "no-store" } });
}
