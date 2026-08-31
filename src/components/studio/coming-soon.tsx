import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { SceneArt } from "./scene-art";

export function ComingSoon({ kind }: { kind: "character" | "workflow" }) {
  const character = kind === "character";
  const items = character
    ? ["Describe an original stylized character", "Preview, refine, and download your 3D model", "Bring animation-ready characters into compatible games"]
    : ["Bring your characters into your worlds", "Keep assets and game projects connected", "Publish, share, and remix with creator permission"];
  return (
    <PageShell>
      <section className="studio-container py-12 sm:py-20">
        <Link href="/" className="studio-back"><ArrowLeft size={16} /> Back to your workspace</Link>
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="studio-pill"><Clock3 size={13} /> Coming soon</span>
            <p className="studio-eyebrow mt-8">{character ? "THE NEXT CHAPTER · BETA" : "THE BIGGER PICTURE"}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{character ? "3D Character Creator" : "Connect the full workflow"}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">{character ? "Every great world needs someone to explore it. We're planning a dedicated character studio, from your first description to an original 3D model." : "A character is only the beginning. This is where your characters, templates, and game ideas will come together in one connected creation workflow."}</p>
            <ul className="my-8 space-y-4">{items.map((item, index) => <li key={item} className="flex gap-3 text-sm text-slate-300"><span className="font-mono text-rose-300">0{index + 1}</span>{item}</li>)}</ul>
            <p className="mb-7 text-sm text-slate-500">Not available in this release. In the meantime, your next playable world starts with the alpha.</p>
            <Link href="/templates" className="studio-primary">Try Templates + AI Builder <ArrowRight size={17} /></Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#10121a]"><SceneArt variant={kind} className="min-h-[420px]" /></div>
        </div>
      </section>
    </PageShell>
  );
}
