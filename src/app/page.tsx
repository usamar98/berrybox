import type { Metadata } from "next";
import { BerryBoxHome } from "@/components/marketing/berrybox-home";

export const metadata: Metadata = {
  title: "BerryBox - AI 3D Scene Generator",
  description:
    "Generate a compact textured 3D scene from a prompt, explore it interactively, and download the GLB.",
};

export default function Home() {
  return <BerryBoxHome />;
}

