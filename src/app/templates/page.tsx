import type { Metadata } from "next";
import { TemplatesPage } from "@/components/templates/templates-page";

export const metadata: Metadata = {
  title: "AI 3D Template Generator",
  description:
    "Generate a game-ready 3D template asset from a prompt and inspect the GLB in an interactive browser viewer.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { prompt } = await searchParams;
  return <TemplatesPage initialPrompt={prompt?.slice(0, 600) ?? ""} />;
}

