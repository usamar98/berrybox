import type { Metadata } from "next";
import { TemplatesPage } from "@/components/templates/templates-page";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Choose a playable 3D game template, customize it with AI, and save your project in the BerryBox alpha.",
};

export default function Page() {
  return <TemplatesPage />;
}

