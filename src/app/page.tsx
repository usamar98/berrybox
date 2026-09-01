import type { Metadata } from "next";
import { BerryBoxHome } from "@/components/marketing/berrybox-home";

export const metadata: Metadata = {
  title: "BerryBox - Build the world. Play the idea.",
  description:
    "Create playable 3D games with templates, AI-assisted setup, hands-on controls, and an instant browser playtest.",
};

export default function Home() {
  return <BerryBoxHome />;
}

