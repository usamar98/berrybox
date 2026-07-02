import type { Metadata } from "next";
import { EditorPage } from "@/components/editor/editor-page";

export const metadata: Metadata = {
  title: "Mock Editor",
  description:
    "Open the BerryBox static mock editor with AI chat, game preview, file tree, code preview, and asset tray.",
};

export default function Page() {
  return <EditorPage />;
}

