import type { Metadata } from "next";
import { BerryBoxHome } from "@/components/marketing/berrybox-home";

export const metadata: Metadata = {
  title: "BerryBox - AI 3D Template Generator",
  description:
    "Generate a game-ready 3D template from a prompt and inspect the GLB in an interactive browser viewer.",
};

export default function Home() {
  return <BerryBoxHome />;
}

