import type { Metadata } from "next";
import { PlayPage } from "@/components/studio/play-page";
import { getTemplate } from "@/lib/studio/config";

export const metadata: Metadata = { title: "Play a template" };
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const params = await searchParams;
  return <PlayPage templateId={getTemplate(params.template).id} />;
}
