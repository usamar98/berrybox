"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Clock3, FolderOpen, Play, Search, Sparkles } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { SceneArt } from "@/components/studio/scene-art";
import { templates, PROJECTS_KEY, parseProjects, type Project } from "@/lib/studio/config";
import { useRouter } from "next/navigation";

export function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setProjects(parseProjects(localStorage.getItem(PROJECTS_KEY))); }
      catch { setStorageError("Your browser's saved projects couldn't be read. Existing data has not been changed."); }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim().length < 3) return;
    router.push("/editor?template=explorer&new=1&prompt=" + encodeURIComponent(prompt.trim()));
  }
  const matching = templates.filter((template) =>
    (template.title + " " + template.category + " " + template.features.join(" ")).toLowerCase().includes(search.toLowerCase()));
  return (
    <PageShell>
      <section className="studio-container py-10 sm:py-14">
        <Link href="/" className="studio-back"><ArrowLeft size={15} /> Workspace</Link>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div><p className="studio-eyebrow">YOUR FIRST WORLD STARTS HERE</p><h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Templates + AI Builder <span className="text-slate-500">alpha</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">Pick a playable 3D starter, then shape it with AI or hands-on controls. Small worlds. Real gameplay. Yours to explore.</p></div>
          <span className="studio-pill pill-live"><span className="status-dot" /> Available now</span>
        </div>
        <form onSubmit={submit} className="my-9 rounded-2xl border border-rose-300/15 bg-gradient-to-br from-rose-300/[0.06] to-transparent p-5 sm:p-6">
          <label htmlFor="game-idea" className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles size={16} className="text-rose-300" /> Have a little idea?</label>
          <div className="flex flex-col gap-3 sm:flex-row"><input id="game-idea" className="studio-field flex-1" placeholder="A desert crystal hunt with purple characters and three guards…" value={prompt} onChange={(event) => setPrompt(event.target.value)} minLength={3} maxLength={500} required /><button className="studio-primary shrink-0" disabled={prompt.trim().length < 3}>Open in AI Builder <ArrowRight size={16} /></button></div>
          <p className="mt-3 text-xs text-slate-500">AI edits supported settings: themes, colors, speed, enemies, crystals, and time. It does not generate arbitrary game code.</p>
        </form>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-medium">Find your starting point <span className="ml-2 text-sm text-slate-500">02</span></h2><label className="flex items-center gap-2 rounded-lg border border-white/10 px-3"><Search size={15} className="text-slate-500" /><input aria-label="Search templates" className="h-10 w-48 bg-transparent text-xs outline-none" placeholder="Search templates…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
        <div className="grid gap-5 md:grid-cols-2">
          {matching.map((template) => <article key={template.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#11151f]">
            <SceneArt variant={template.id} />
            <div className="p-6"><p className="studio-eyebrow">{template.category}</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">{template.title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{template.description}</p><div className="my-5 flex flex-wrap gap-2">{template.features.map((feature) => <span key={feature} className="studio-pill">{feature}</span>)}</div><div className="flex gap-3"><Link href={"/editor?template=" + template.id + "&new=1"} className="studio-primary flex-1">Use template <ArrowRight size={16} /></Link><Link href={"/play?template=" + template.id} className="studio-secondary"><Play size={15} /> Preview</Link></div></div>
          </article>)}
        </div>
        {!matching.length ? <p role="status" className="rounded-xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">No templates match that search. Try “explore” or “obstacle”.</p> : null}
        <div className="mt-12 flex flex-wrap items-center gap-2"><FolderOpen size={18} className="text-rose-300" /><h2 className="text-lg font-medium">Your projects</h2><span className="ml-auto text-xs text-slate-500">Saved in this browser · not cloud-backed</span></div>
        {storageError ? <p role="alert" className="mt-4 text-sm text-amber-200">{storageError}</p> : null}
        {projects.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <Link key={project.id} href={"/editor?project=" + encodeURIComponent(project.id)} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-rose-300/30"><p className="font-medium">{project.config.title}</p><p className="mt-2 text-xs text-slate-500">{templates.find((template) => template.id === project.config.template)?.category}</p><div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><Clock3 size={13} />{new Date(project.updatedAt).toLocaleDateString()}<ArrowRight size={14} className="ml-auto" /></div></Link>)}</div>
          : <div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">Your next creation belongs here. Open a template and save your first project.</div>}
      </section>
    </PageShell>
  );
}
