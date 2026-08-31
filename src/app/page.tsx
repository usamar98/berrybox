import type { Metadata } from "next";
import { LaunchHub } from "@/components/studio/launch-hub";

export const metadata: Metadata = {
  title: "BerryBox - Your game creation workspace",
  description:
    "Build a playable 3D game with templates and AI. Explore what's next for character creation and connected workflows.",
};

export default function Home() {
  return <LaunchHub />;
}

