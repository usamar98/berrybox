"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTemplate, type TemplateId } from "@/lib/studio/config";
import { PageShell } from "@/components/shared/page-shell";

const GamePreview = dynamic(() => import("./game-preview"), { ssr: false, loading: () => <div className="grid h-[490px] place-items-center text-sm text-slate-400">Loading your 3D world…</div> });
export function PlayPage({ templateId }: { templateId: TemplateId }) {
  const template = getTemplate(templateId);
  return <PageShell><section className="studio-container py-10"><Link href="/templates" className="studio-back"><ArrowLeft size={16} /> Back to templates</Link><div className="my-7 flex flex-wrap items-center justify-between gap-4"><div><p className="studio-eyebrow">PLAYABLE TEMPLATE</p><h1 className="mt-3 text-3xl font-semibold">{template.title}</h1></div><Link href={"/editor?template=" + templateId + "&new=1"} className="studio-primary">Make it yours <ArrowRight size={16} /></Link></div><GamePreview config={template.config} /></section></PageShell>;
}
