import type { Metadata } from "next";
import { Builder } from "@/components/studio/builder";

export const metadata: Metadata = {
  title: "AI Game Builder alpha",
  description:
    "Customize a playable 3D template with AI, manual game settings, and browser-local project saving.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string | string[]; template?: string; project?: string }>;
}) {
  const params = await searchParams;
  const rawPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;
  const initialPrompt = rawPrompt?.trim().slice(0, 500) ?? "";

  return <Builder key={(params.project ?? params.template ?? "new") + initialPrompt} templateId={params.template} projectId={params.project} initialPrompt={initialPrompt} />;
}

