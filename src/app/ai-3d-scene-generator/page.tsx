import type { Metadata } from "next";
import { SceneGeneratorPage } from "@/components/scenes/scene-generator-page";

export const metadata: Metadata = {
  title: "AI 3D Scene Generator",
  description: "Generate a small textured 3D scene from a prompt, explore it interactively, and download the GLB model.",
};

export default async function Ai3DSceneGeneratorRoute({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { prompt } = await searchParams;
  return <SceneGeneratorPage initialPrompt={typeof prompt === "string" ? prompt : ""} />;
}
