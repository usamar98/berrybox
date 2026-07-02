import type { Metadata } from "next";
import { GalleryPage } from "@/components/gallery/gallery-page";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore a static public gallery of mock generated games with play, clone, and remix actions.",
};

export default function Page() {
  return <GalleryPage />;
}

