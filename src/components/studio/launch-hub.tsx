import Link from "next/link";
import { ArrowUpRight, Box, Layers3, Sparkles, Workflow } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { SceneArt } from "./scene-art";

const launches = [
  { number: "01", title: "Templates + AI Builder", stage: "alpha", href: "/templates", available: true, icon: Layers3, art: "explorer" as const, text: "Start with a playable world. Shape it with your ideas. Build something that's yours.", action: "Start building" },
  { number: "02", title: "3D Character Creator", stage: "beta", href: "/characters", available: false, icon: Box, art: "character" as const, text: "Bring your next hero to life. A dedicated space for creating game-ready characters.", action: "Explore what's next" },
  { number: "03", title: "Connect the full workflow", stage: "", href: "/workflow", available: false, icon: Workflow, art: "workflow" as const, text: "Your characters, worlds, and ideas. One connected journey from first spark to release.", action: "Explore the workflow" },
];

export function LaunchHub() {
  return (
    <PageShell>
      <section className="studio-container pb-20 pt-12 sm:pt-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="studio-eyebrow"><Sparkles size={14} /> THE CREATOR&apos;S PLAYGROUND</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-6xl">Small ideas.<br /><span className="text-rose-300">Playable possibilities.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">A home for the things you want to make. Choose your starting point and let&apos;s build your next game.</p>
          </div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-400"><span className="status-dot" /> One workspace. Three possibilities.</div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {launches.map((launch) => (
            <Link key={launch.href} href={launch.href} className="launch-card group">
              <div className="flex items-center justify-between px-6 pt-6">
                <span className="font-mono text-xs text-slate-500">/ {launch.number}</span>
                <span className={launch.available ? "studio-pill pill-live" : "studio-pill"}>{launch.available ? "Available now" : "Coming soon"}</span>
              </div>
              <SceneArt variant={launch.art} />
              <div className="flex flex-1 flex-col px-6 pb-6">
                <launch.icon className="mb-4 h-5 w-5 text-rose-300" />
                <h2 className="text-xl font-semibold tracking-tight">{launch.title}{launch.stage ? <span className="ml-2 text-sm font-normal text-slate-500"> {launch.stage}</span> : null}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{launch.text}</p>
                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5 text-sm font-medium">
                  <span>{launch.action}</span><ArrowUpRight className="h-5 w-5 text-rose-300 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-3 text-xs text-slate-500"><span>Made for curious minds, first-time builders, and indie creators.</span><span>Build a little. Play a lot.</span></div>
      </section>
    </PageShell>
  );
}
