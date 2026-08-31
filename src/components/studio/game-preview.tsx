"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { mountWorld, type PlayStats } from "@/lib/studio/render-world";
import { gameGoal, type GameConfig } from "@/lib/studio/config";

export default function GamePreview({ config }: { config: GameConfig }) {
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const playing = useRef(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [stats, setStats] = useState<PlayStats>({ collected: 0, health: config.health, seconds: config.timeLimit, status: "playing" });
  useEffect(() => {
    if (!host.current) return;
    let cleanup: (() => void) | undefined;
    try {
      cleanup = mountWorld(host.current, config, () => ({
        x: Number(keys.current.has("arrowright") || keys.current.has("d")) - Number(keys.current.has("arrowleft") || keys.current.has("a")),
        z: Number(keys.current.has("arrowdown") || keys.current.has("s")) - Number(keys.current.has("arrowup") || keys.current.has("w")),
        jump: keys.current.has(" "),
      }), () => playing.current, setStats, () => { playing.current = false; setError(true); });
    } catch {
      queueMicrotask(() => setError(true));
    }
    function pause() { playing.current = false; keys.current.clear(); setRunning(false); }
    document.addEventListener("visibilitychange", pause);
    window.addEventListener("blur", pause);
    return () => {
      cleanup?.();
      document.removeEventListener("visibilitychange", pause);
      window.removeEventListener("blur", pause);
    };
  }, [config, generation]);
  function toggle() {
    playing.current = !playing.current;
    setRunning(playing.current);
    if (playing.current) surface.current?.focus();
  }
  function reset() {
    playing.current = false;
    keys.current.clear();
    setRunning(false);
    setError(false);
    setStats({ collected: 0, health: config.health, seconds: config.timeLimit, status: "playing" });
    setGeneration((value) => value + 1);
  }
  const controlKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111823]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex items-center gap-2 text-xs font-medium"><span className="status-dot" /> Live 3D preview</span>
        <div className="flex gap-2"><button type="button" className="studio-secondary !px-3 !py-1.5" onClick={reset} aria-label="Reset game"><RotateCcw size={13} /> Reset</button><button type="button" className="studio-secondary !px-3 !py-1.5" onClick={toggle} disabled={error || stats.status !== "playing"}>{running ? <Pause size={13} /> : <Play size={13} />}{running ? "Pause" : "Play"}</button></div>
      </div>
      <div ref={surface} tabIndex={0} role="group" aria-label="Game controls. Arrow keys or WASD to move, Space to jump." className="relative outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300"
        onKeyDown={(event) => { const key = event.key.toLowerCase(); if (controlKeys.includes(key)) { event.preventDefault(); keys.current.add(key); } }}
        onKeyUp={(event) => keys.current.delete(event.key.toLowerCase())}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { keys.current.clear(); playing.current = false; setRunning(false); } }}>
        <div ref={host} className="h-[430px] w-full sm:h-[490px]" />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-lg bg-black/45 px-3 py-2 text-emerald-200">Crystals {stats.collected}/{config.collectibleCount}</span>
          <span className="rounded-lg bg-black/45 px-3 py-2 text-rose-200">Health {stats.health}</span>
          <span className="rounded-lg bg-black/45 px-3 py-2 text-white">{stats.seconds}s</span>
        </div>
        {error ? <div role="alert" className="absolute inset-0 grid place-content-center bg-[#0d1420]/95 p-8 text-center"><p className="text-lg font-medium">3D preview is unavailable</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">This view needs WebGL 2. Try a hardware-accelerated browser. Your project settings are still available.</p><button className="studio-secondary mx-auto mt-5" onClick={reset}>Retry preview</button></div>
          : !running || stats.status !== "playing" ? <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="max-w-xs rounded-2xl border border-white/15 bg-[#111722]/90 p-6 text-center shadow-xl backdrop-blur-md">
              <Sparkles className="mx-auto mb-3 text-rose-200" size={23} />
              <h3 className="text-lg font-semibold">{stats.status === "won" ? "World completed!" : stats.status === "lost" ? "One more try?" : "Ready when you are."}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">{stats.status === "playing" ? gameGoal(config) : stats.status === "won" ? "Every crystal found. Make the next run your own." : "Reset the game or tune the difficulty in the builder."}</p>
              <button type="button" className="studio-primary mt-4" onClick={stats.status === "playing" ? toggle : reset}>{stats.status === "playing" ? <><Play size={15} />{stats.seconds === config.timeLimit ? "Play game" : "Resume"}</> : <><RotateCcw size={15} /> Reset game</>}</button>
            </div>
          </div> : null}
        {running && stats.status === "playing" ? <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="grid grid-cols-3 gap-1"><span /><TouchKey label="Move forward" keyName="arrowup" keys={keys}><ArrowUp size={17} /></TouchKey><span /><TouchKey label="Move left" keyName="arrowleft" keys={keys}><ArrowLeft size={17} /></TouchKey><TouchKey label="Move backward" keyName="arrowdown" keys={keys}><ArrowDown size={17} /></TouchKey><TouchKey label="Move right" keyName="arrowright" keys={keys}><ArrowRight size={17} /></TouchKey></div>
          <TouchKey label="Jump" keyName=" " keys={keys}>Jump</TouchKey>
        </div> : null}
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-[11px] leading-5 text-slate-400">Click Play, then use <span className="text-slate-200">WASD / arrow keys</span> to move and <span className="text-slate-200">Space</span> to jump. Touch controls are also available.</p>
    </div>
  );
}

function TouchKey({ label, keyName, keys, children }: { label: string; keyName: string; keys: React.RefObject<Set<string>>; children: React.ReactNode }) {
  return <button type="button" aria-label={label} className="flex h-10 min-w-10 touch-none select-none items-center justify-center rounded-lg border border-white/15 bg-black/55 px-3 text-xs text-white"
    onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); keys.current.add(keyName); }}
    onPointerUp={() => keys.current.delete(keyName)} onPointerCancel={() => keys.current.delete(keyName)} onLostPointerCapture={() => keys.current.delete(keyName)}>{children}</button>;
}
