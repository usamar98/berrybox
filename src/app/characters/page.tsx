import type { Metadata } from "next";
import { CharacterPage } from "@/components/characters/character-page";

export const metadata: Metadata = {
  title: "AI 3D Character Creator",
  description: "Generate, rig, animate, preview, and download an original 3D game character from a text prompt.",
};

export default function Page() { return <CharacterPage />; }
