import type { Metadata } from "next";
import { CharacterGeneratorPage } from "@/components/characters/character-generator-page";

export const metadata: Metadata = {
  title: "AI 3D Character Generator",
  description: "Create an original textured 3D character from a prompt, inspect it interactively, and download a private GLB model.",
};

export default async function Ai3DCharacterGeneratorRoute({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { prompt } = await searchParams;
  return <CharacterGeneratorPage initialPrompt={typeof prompt === "string" ? prompt : ""} />;
}
