import type { Metadata } from "next";
import { TemplatesPage } from "@/components/templates/templates-page";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse static mock game templates for BerryBox, including RPG, platformer, visual novel, racing, puzzle, 3D, AI NPC, and shooter starters.",
};

export default function Page() {
  return <TemplatesPage />;
}

