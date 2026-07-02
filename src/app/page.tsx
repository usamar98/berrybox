import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "BerryBox - Build playable games from a prompt",
  description:
    "Create a static AI game maker SaaS demo with templates, a mock editor, sample game previews, gallery, pricing, and roadmap.",
};

export default function Home() {
  return <LandingPage />;
}

