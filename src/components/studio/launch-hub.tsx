import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Box,
  Braces,
  Gamepad2,
  HardDrive,
  Layers3,
  Sparkles,
  Workflow,
} from "lucide-react";
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
      <section className="workspace-hero">
        <div className="workspace-grid" aria-hidden="true" />
        <div className="workspace-glow workspace-glow-one" aria-hidden="true" />
        <div className="workspace-glow workspace-glow-two" aria-hidden="true" />
        <div className="studio-container relative z-10 py-14 sm:py-20 lg:py-24">
          <div className="workspace-hero-layout">
            <div className="workspace-copy">
              <p className="studio-eyebrow"><Sparkles size={14} /> THE CREATOR&apos;S PLAYGROUND</p>
              <h1>Turn your ideas into <span>playable games.</span></h1>
              <p className="workspace-lead">Describe the world you imagine. Start from a polished template, customize the gameplay, and step inside a real 3D prototype.</p>
              <div className="workspace-actions">
                <Link href="/editor" className="workspace-primary">Start creating <ArrowRight size={17} /></Link>
                <Link href="/templates" className="workspace-secondary">Explore templates</Link>
              </div>
              <div className="workspace-engine">
                <p><span className="status-dot" /> AI-assisted game creation</p>
                <div>
                  <span><Bot size={14} /> OpenAI</span>
                  <span><Braces size={14} /> No code</span>
                  <span><HardDrive size={14} /> Browser-local</span>
                </div>
              </div>
            </div>

            <CreatorVisual />
          </div>

          <div className="workspace-capabilities">
            <div><Sparkles /><span><strong>AI-assisted</strong> creation</span></div>
            <div><Braces /><span><strong>No code</strong> required</span></div>
            <div><Gamepad2 /><span><strong>Playable 3D</strong> previews</span></div>
            <div><HardDrive /><span><strong>Save</strong> your projects</span></div>
          </div>
        </div>
      </section>

      <section className="studio-container py-16 sm:py-20">
        <div className="workspace-path-heading">
          <div>
            <p className="studio-eyebrow"><Layers3 size={14} /> CHOOSE YOUR CREATION PATH</p>
            <h2>One workspace. Three possibilities.</h2>
          </div>
          <p>Start with what works today, then watch your full game-making workflow grow.</p>
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

function CreatorVisual() {
  return (
    <div className="workspace-visual" aria-label="A collage of worlds you can create with BerryBox">
      <div className="workspace-orbit orbit-one" aria-hidden="true" />
      <div className="workspace-orbit orbit-two" aria-hidden="true" />
      <div className="workspace-preview preview-one">
        <Image src="/game-cards/3d-world-explorer.png" alt="A floating fantasy world" fill sizes="(max-width: 768px) 38vw, 210px" />
        <span>EXPLORE</span>
      </div>
      <div className="workspace-preview preview-two">
        <Image src="/game-cards/arcade-shooter.png" alt="A colorful space arcade game" fill sizes="(max-width: 768px) 32vw, 170px" />
        <span>PLAY</span>
      </div>
      <div className="workspace-preview preview-three">
        <Image src="/game-cards/platformer-game.png" alt="A bright platform game world" fill sizes="(max-width: 768px) 34vw, 190px" />
        <span>BUILD</span>
      </div>
      <div className="workspace-core">
        <span className="workspace-core-ring" aria-hidden="true" />
        <Image src="/berrybox.png" alt="BerryBox" width={250} height={250} priority />
        <div><span className="status-dot" /> BUILDER ALPHA IS LIVE</div>
      </div>
      <span className="workspace-spark spark-one" aria-hidden="true">✦</span>
      <span className="workspace-spark spark-two" aria-hidden="true">✦</span>
      <span className="workspace-spark spark-three" aria-hidden="true">✦</span>
    </div>
  );
}
