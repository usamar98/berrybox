"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Box, Download, LoaderCircle, Save, Send, SlidersHorizontal, Sparkles, Undo2, Upload } from "lucide-react";
import { GameConfigSchema, ProjectSchema, PROJECTS_KEY, gameGoal, getTemplate, parseProjects, upsertProject, type GameConfig } from "@/lib/studio/config";

const GamePreview = dynamic(() => import("./game-preview"), { ssr: false, loading: () => <div className="grid h-[530px] place-items-center rounded-2xl border border-white/10 text-sm text-slate-400">Preparing your 3D world…</div> });
type Message = { role: "user" | "assistant"; text: string };

export function Builder({ templateId, projectId, initialPrompt }: { templateId?: string; projectId?: string; initialPrompt: string }) {
  const [config, setConfig] = useState<GameConfig>(() => structuredClone(getTemplate(templateId).config));
  const [history, setHistory] = useState<GameConfig[]>([]);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Your template is ready to play. Tell me what to change, or use the settings below. I can adjust the theme, colors, speed, enemies, crystals, and timer." }]);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);
  const identity = useRef(projectId ?? "");
  const abort = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!identity.current) identity.current = crypto.randomUUID();
      if (projectId) {
        try {
          const project = parseProjects(localStorage.getItem(PROJECTS_KEY)).find((entry) => entry.id === projectId);
          if (!project) { identity.current = crypto.randomUUID(); throw new Error("This saved project was not found in this browser. A new template is open instead."); }
          setConfig(project.config);
          setNotice("Saved project restored.");
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not restore project."); }
      }
      setReady(true);
    }, 0);
    const controller = new AbortController();
    fetch("/api/studio/generate", { signal: controller.signal }).then((response) => response.json()).then((data) => setAvailable(Boolean(data.available))).catch(() => { if (!controller.signal.aborted) setAvailable(false); });
    return () => { clearTimeout(timer); controller.abort(); abort.current?.abort(); };
  }, [projectId]);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => { conversation.current?.scrollTo({ top: conversation.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);
  function apply(next: GameConfig) {
    const parsed = GameConfigSchema.safeParse(next);
    if (!parsed.success) { setError("That setting is outside the supported range."); return; }
    setHistory((previous) => [...previous.slice(-19), config]);
    setConfig(parsed.data);
    setDirty(true);
    setNotice("");
    setError("");
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous || busy) return;
    setConfig(previous);
    setHistory((items) => items.slice(0, -1));
    setDirty(true);
    setNotice("Last edit undone.");
  }
  function save() {
    try {
      const project = ProjectSchema.parse({ version: 1, id: identity.current, updatedAt: new Date().toISOString(), config });
      const projects = parseProjects(localStorage.getItem(PROJECTS_KEY));
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(upsertProject(projects, project)));
      setDirty(false);
      setError("");
      setNotice("Project saved in this browser.");
      window.history.replaceState(null, "", "/editor?project=" + encodeURIComponent(identity.current));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Saving failed. Export a JSON backup instead."); }
  }
  function exportProject() {
    const blob = new Blob([JSON.stringify({ version: 1, id: identity.current, updatedAt: new Date().toISOString(), config }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (config.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "game") + ".berrybox.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("JSON backup exported. Import it into BerryBox to continue editing.");
  }
  async function importProject(file?: File) {
    if (!file || busy) return;
    if (file.size > 20_000) { setError("Choose a BerryBox JSON project smaller than 20 KB."); return; }
    try {
      const project = ProjectSchema.parse(JSON.parse(await file.text()));
      apply(project.config);
      // Imports are copies; do not overwrite an existing saved project.
      identity.current = crypto.randomUUID();
      setNotice("Project imported as a new copy. Save to keep it in this browser.");
    } catch { setError("This isn't a valid BerryBox alpha JSON project. Your current game is unchanged."); }
  }
  async function generate(event: FormEvent) {
    event.preventDefault();
    const text = prompt.trim();
    if (busy || !ready || text.length < 3 || available !== true) return;
    setBusy(true);
    setError("");
    setNotice("");
    setMessages((previous) => [...previous, { role: "user", text }]);
    const controller = new AbortController();
    abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch("/api/studio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text, config }), signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The game edit failed.");
      const next = GameConfigSchema.parse(result.config);
      apply(next);
      setMessages((previous) => [...previous, { role: "assistant", text: result.message }]);
      setPrompt("");
      setNotice("AI edit applied. Play the preview, then save your changes.");
    } catch (failure) {
      const text = controller.signal.aborted ? "The request timed out or was cancelled. Your game is unchanged." : failure instanceof Error ? failure.message : "The game edit failed. Your game is unchanged.";
      setError(text);
      setMessages((previous) => [...previous, { role: "assistant", text }]);
    } finally { clearTimeout(timeout); setBusy(false); abort.current = null; }
  }
  const inputDisabled = busy || !ready;
  return (
    <main className="min-h-screen bg-[#0b0f17]">
      <header className="border-b border-white/10 bg-[#0e121c] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4"><Link href="/templates" aria-label="Back to templates" onClick={(event) => { if (dirty && !window.confirm("You have unsaved changes. Leave this project?")) event.preventDefault(); }} className="studio-secondary !p-2.5"><ArrowLeft size={17} /></Link><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[.18em] text-rose-300">BERRYBOX / AI BUILDER ALPHA</p><h1 className="mt-1 truncate text-lg font-semibold">{config.title}</h1></div></div>
          <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-[11px] text-slate-500">{dirty ? "Unsaved changes" : "Browser-local project"}</span><button className="studio-secondary" onClick={undo} disabled={!history.length || inputDisabled} aria-label="Undo last edit"><Undo2 size={15} /></button><button className="studio-secondary" onClick={() => fileInput.current?.click()} disabled={inputDisabled}><Upload size={14} /> Import</button><button className="studio-secondary" onClick={exportProject} disabled={inputDisabled}><Download size={14} /> Export JSON</button><button className="studio-primary !py-2.5" onClick={save} disabled={inputDisabled}><Save size={14} /> Save project</button><input ref={fileInput} type="file" accept=".json,application/json" className="hidden" aria-label="Import BerryBox project" onChange={(event) => { void importProject(event.target.files?.[0]); event.target.value = ""; }} /></div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
        {(error || notice) ? <p role={error ? "alert" : "status"} className={"mb-4 rounded-lg border px-4 py-3 text-xs leading-5 " + (error ? "border-amber-200/20 bg-amber-300/5 text-amber-200" : "border-emerald-200/15 bg-emerald-300/5 text-emerald-200")}>{error || notice}</p> : null}
        <div className="grid items-start gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="order-2 overflow-hidden rounded-2xl border border-white/10 bg-[#111620] xl:order-1">
            <div className="border-b border-white/10 p-5"><div className="flex items-center gap-2"><Sparkles size={18} className="text-rose-300" /><h2 className="font-medium">Build with a conversation</h2></div><p className="mt-3 text-xs leading-5 text-slate-500">Make small changes. Play them back. Repeat.</p><span className="studio-pill mt-3">{available === null ? "Checking AI availability…" : available ? "OpenAI configured" : "AI unavailable · manual editing works"}</span></div>
            <div ref={conversation} className="max-h-[350px] space-y-4 overflow-auto p-4" aria-live="polite" aria-relevant="additions">{messages.map((message, index) => <div key={index} className={message.role === "user" ? "ml-4 rounded-xl bg-rose-300/10 p-3" : "mr-2 rounded-xl bg-white/[0.025] p-3"}><p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-rose-200">{message.role === "user" ? "You" : "BerryBox"}</p><p className="whitespace-pre-wrap text-xs leading-6 text-slate-300">{message.text}</p></div>)}{busy ? <p className="flex items-center gap-2 text-xs text-rose-200"><LoaderCircle size={14} className="animate-spin" /> Shaping your world…</p> : null}</div>
            <form onSubmit={generate} className="border-t border-white/10 p-4"><label htmlFor="builder-prompt" className="sr-only">Describe a game change</label><textarea id="builder-prompt" className="studio-field min-h-24 resize-y" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Make it a desert with purple characters…" maxLength={500} minLength={3} required disabled={inputDisabled} /><div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-slate-500">{prompt.length}/500</span>{busy ? <button type="button" className="studio-secondary" onClick={() => abort.current?.abort()}>Cancel</button> : <button className="studio-primary !px-4 !py-2" disabled={inputDisabled || prompt.trim().length < 3 || !available}><Send size={14} /> Apply AI edit</button>}</div><p className="mt-3 text-[10px] leading-4 text-slate-500">Your prompt and game settings are sent to OpenAI when you apply an edit.</p></form>
            <div className="space-y-2 border-t border-white/10 p-4"><p className="mb-3 text-[10px] uppercase tracking-wider text-slate-500">A little inspiration</p>{["Use a desert theme and a violet player", "Add 3 enemies that chase me", "Give me 5 health and 180 seconds"].map((example) => <button key={example} className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/5 p-2.5 text-left text-[11px] text-slate-400 hover:bg-white/5" disabled={inputDisabled} onClick={() => setPrompt(example)}>{example}<ArrowRight size={12} className="shrink-0" /></button>)}</div>
          </aside>
          <div className="order-1 min-w-0 space-y-5 xl:order-2">
            <GamePreview key={JSON.stringify(config)} config={config} />
            <section className="rounded-2xl border border-white/10 bg-[#111620] p-5">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal size={17} className="text-rose-300" /> Make it yours</h2><span className="text-[10px] text-slate-500">Changes restart the preview</span></div>
              <fieldset disabled={inputDisabled} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="sm:col-span-2"><span className="studio-label">Project name</span><input key={config.title} defaultValue={config.title} className="studio-field" maxLength={60} minLength={2} onBlur={(event) => { if (event.target.value.trim() !== config.title) apply({ ...config, title: event.target.value }); }} /></label>
                <SettingSelect label="Theme" value={config.theme} options={["forest", "neon", "desert"]} onChange={(theme) => apply({ ...config, theme })} />
                <SettingSelect label="Player color" value={config.playerColor} options={["mint", "rose", "violet", "gold"]} onChange={(playerColor) => apply({ ...config, playerColor })} />
                <NumberSetting label="Move speed" value={config.moveSpeed} min={3} max={10} onChange={(moveSpeed) => apply({ ...config, moveSpeed })} />
                <NumberSetting label="Health" value={config.health} min={1} max={5} onChange={(health) => apply({ ...config, health })} />
                <NumberSetting label="Crystals" value={config.collectibleCount} min={3} max={12} onChange={(collectibleCount) => apply({ ...config, collectibleCount })} />
                <NumberSetting label="Enemies" value={config.enemyCount} min={0} max={6} onChange={(enemyCount) => apply({ ...config, enemyCount })} />
                <SettingSelect label="Enemy behavior" value={config.behavior} options={["patrol", "chase", "guard"]} onChange={(behavior) => apply({ ...config, behavior })} />
                <NumberSetting label="Enemy speed" value={config.enemySpeed} min={.5} max={3} step={.5} onChange={(enemySpeed) => apply({ ...config, enemySpeed })} />
                <NumberSetting label="Time limit (seconds)" value={config.timeLimit} min={30} max={180} step={10} onChange={(timeLimit) => apply({ ...config, timeLimit })} />
              </fieldset>
              <p className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400"><Box size={14} className="mt-0.5 shrink-0 text-rose-300" />{gameGoal(config)} This alpha uses built-in 3D characters and scenery. JSON export is a project backup, not a standalone game.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return <label><span className="studio-label">{label}</span><select className="studio-field capitalize" value={value} onChange={(event) => onChange(event.target.value as T)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
function NumberSetting({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label><span className="studio-label">{label} <span className="float-right text-slate-200">{value}</span></span><input aria-label={label} type="range" className="mt-2 w-full accent-rose-300" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
