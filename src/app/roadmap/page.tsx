import type { Metadata } from "next";
import { RoadmapPage } from "@/components/roadmap/roadmap-page";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "See the BerryBox phased roadmap from static frontend to auth, database, real AI generation, publishing, payments, 3D worlds, multiplayer, and marketplace.",
};

export default function Page() {
  return <RoadmapPage />;
}

