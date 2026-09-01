import { characterGenerationAvailable, configuredCharacterModels, configuredGameModels, configuredTemplateModels, templateGenerationAvailable } from "@/lib/3d/fal";

export const runtime = "nodejs";

export function GET() {
  const keyConfigured = Boolean(process.env.FAL_KEY);
  return Response.json({
    providers: [
      { feature: "3d-template", provider: "fal.ai", configured: keyConfigured, enabled: templateGenerationAvailable(), status: "available", models: configuredTemplateModels() },
      { feature: "3d-character", provider: "fal.ai", configured: keyConfigured && configuredCharacterModels().length > 0, enabled: characterGenerationAvailable(), status: "available", models: configuredCharacterModels() },
      { feature: "3d-game", provider: "fal.ai + OpenAI Responses", configured: keyConfigured && configuredGameModels().length > 0 && Boolean(process.env.OPENAI_API_KEY), enabled: false, status: "coming-soon", models: configuredGameModels() },
      { feature: "source-video", provider: "Pexels", configured: Boolean(process.env.PEXELS_API_KEY), enabled: false, status: "source-link-only" },
    ],
  }, { headers: { "Cache-Control": "no-store" } });
}
