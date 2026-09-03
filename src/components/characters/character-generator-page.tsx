"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clipboard, Clock3, Download, LoaderCircle, RefreshCw, Sparkles, Trash2, UserRound } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { SceneModelViewer } from "@/components/scenes/scene-model-viewer";
import { CHARACTER_PROMPT_MAX } from "@/lib/3d-characters/prompt";
import type { CharacterBodyPlan, CharacterPose, CharacterStyle, PublicCharacter } from "@/lib/3d-characters/types";

const examples: Array<{ prompt: string; style: CharacterStyle; bodyPlan: CharacterBodyPlan; pose: CharacterPose }> = [
  { prompt: "A brave female sky ranger with layered leather armor, a short cape, utility pouches, and wind-swept silver hair.", style: "stylized", bodyPlan: "humanoid", pose: "a-pose" },
  { prompt: "A friendly moss-covered forest guardian creature with wooden antlers, stone plates, and glowing amber eyes.", style: "realistic", bodyPlan: "creature", pose: "neutral" },
  { prompt: "A compact salvage robot with asymmetrical armor, expressive camera eyes, magnetic boots, and orange utility panels.", style: "low-poly", bodyPlan: "robot", pose: "t-pose" },
];

const styleOptions: Array<{ value: CharacterStyle; label: string }> = [
  { value: "stylized", label: "Stylized" },
  { value: "realistic", label: "Realistic" },
  { value: "anime", label: "Anime" },
  { value: "low-poly", label: "Low-poly" },
];
const bodyOptions: Array<{ value: CharacterBodyPlan; label: string }> = [
  { value: "humanoid", label: "Humanoid" },
  { value: "creature", label: "Creature" },
  { value: "robot", label: "Robot" },
];
const poseOptions: Array<{ value: CharacterPose; label: string }> = [
  { value: "a-pose", label: "A-pose" },
  { value: "t-pose", label: "T-pose" },
  { value: "neutral", label: "Neutral" },
];

type HistoryResponse = {
  available: boolean;
  provider: string;
  output: string;
  model: string;
  quota: number;
  missingConfiguration: string[];
  items: PublicCharacter[];
  pagination: { page: number; pageSize: number; total: number; pages: number };
};

const workingStatuses = new Set(["queued", "processing"]);

async function fetchHistoryPage(page: number) {
  const response = await fetch(`/api/3d-characters?page=${page}`, { cache: "no-store" });
  const data = await response.json() as HistoryResponse & { error?: string };
  if (!response.ok) throw new Error(data.error || "Character history could not be loaded.");
  return data;
}

export function CharacterGeneratorPage({ initialPrompt = "" }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt.trim().slice(0, CHARACTER_PROMPT_MAX) || examples[0].prompt);
  const [style, setStyle] = useState<CharacterStyle>("stylized");
  const [bodyPlan, setBodyPlan] = useState<CharacterBodyPlan>("humanoid");
  const [pose, setPose] = useState<CharacterPose>("a-pose");
  const [selected, setSelected] = useState<PublicCharacter>();
  const [history, setHistory] = useState<HistoryResponse>();
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (requestedPage: number, quiet = false) => {
    if (!quiet) setLoadingHistory(true);
    try {
      const data = await fetchHistoryPage(requestedPage);
      setHistory(data);
      setSelected((current) => current || data.items[0]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Character history could not be loaded.");
    } finally {
      if (!quiet) setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchHistoryPage(page).then((data) => {
      if (!active) return;
      setHistory(data);
      setSelected((current) => current || data.items[0]);
      setLoadingHistory(false);
    }).catch((requestError: unknown) => {
      if (!active) return;
      setError(requestError instanceof Error ? requestError.message : "Character history could not be loaded.");
      setLoadingHistory(false);
    });
    return () => { active = false; };
  }, [page]);

  useEffect(() => {
    if (!selected || !workingStatuses.has(selected.status)) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/3d-characters/${selected.id}`, { method: "POST", cache: "no-store" });
        const data = await response.json() as { character?: PublicCharacter; error?: string };
        if (!response.ok || !data.character) throw new Error(data.error || "Character status could not be refreshed.");
        setSelected(data.character);
        if (!workingStatuses.has(data.character.status)) void loadHistory(page, true);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Character status could not be refreshed.");
      }
    }, 5_000);
    return () => window.clearInterval(interval);
  }, [loadHistory, page, selected]);

  const active = selected && workingStatuses.has(selected.status);
  const stages = ["queued", "creating_geometry", "adding_textures", "saving_model", "ready"];
  const stageIndex = selected ? Math.max(0, stages.indexOf(selected.stage)) : -1;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim().length < 12 || submitting || active) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/3d-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), submissionKey: crypto.randomUUID(), style, bodyPlan, pose }),
      });
      const data = await response.json() as { character?: PublicCharacter; error?: string };
      if (!response.ok || !data.character) throw new Error(data.error || "The character could not be queued.");
      setSelected(data.character);
      setPage(1);
      await loadHistory(1, true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The character could not be queued.");
    } finally {
      setSubmitting(false);
    }
  }

  function prepareAgain(character: PublicCharacter) {
    setPrompt(character.prompt);
    setStyle(character.settings.style);
    setBodyPlan(character.settings.bodyPlan);
    setPose(character.settings.pose);
  }

  function applyExample(example: (typeof examples)[number]) {
    setPrompt(example.prompt);
    setStyle(example.style);
    setBodyPlan(example.bodyPlan);
    setPose(example.pose);
  }

  async function removeCharacter(character: PublicCharacter) {
    if (!window.confirm("Delete this character and its stored files?")) return;
    setError("");
    const response = await fetch(`/api/3d-characters/${character.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setError(data.error || "The character could not be deleted.");
      return;
    }
    if (selected?.id === character.id) setSelected(undefined);
    await loadHistory(page);
  }

  return (
    <PageShell>
      <main className="scene-generator-page character-generator-page">
        <section className="scene-generator-hero">
          <div className="scene-generator-heading">
            <span><Sparkles size={14} /> AI CHARACTER LAB / ACTIVE</span>
            <h1>AI 3D Character Generator</h1>
            <p>Describe an original character. Generate, inspect, and download a textured 3D model.</p>
          </div>

          <div className="scene-workspace">
            <aside className="scene-prompt-panel">
              <div className="scene-panel-kicker"><span>01</span><p><b>Direct the character</b><small>Full-body · isolated · textured</small></p></div>
              <form onSubmit={submit}>
                <label htmlFor="character-prompt">Describe one character</label>
                <textarea id="character-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} minLength={12} maxLength={CHARACTER_PROMPT_MAX} rows={7} disabled={submitting || active} />
                <div className="scene-character-count"><span>Describe silhouette, outfit, materials, and defining details.</span><b>{prompt.length} / {CHARACTER_PROMPT_MAX}</b></div>
                <div className="character-options-grid">
                  <label>Character type<select value={bodyPlan} onChange={(event) => setBodyPlan(event.target.value as CharacterBodyPlan)} disabled={submitting || active}>{bodyOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
                  <label>Visual style<select value={style} onChange={(event) => setStyle(event.target.value as CharacterStyle)} disabled={submitting || active}>{styleOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
                  <label>Presentation pose<select value={pose} onChange={(event) => setPose(event.target.value as CharacterPose)} disabled={submitting || active}>{poseOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
                </div>
                <div className="scene-example-chips" aria-label="Example character prompts">
                  {examples.map((example, index) => <button type="button" key={example.prompt} onClick={() => applyExample(example)} disabled={submitting || active}>Example {String(index + 1).padStart(2, "0")}</button>)}
                </div>
                <button className="scene-generate-button" type="submit" disabled={prompt.trim().length < 12 || submitting || active || history?.available === false}>
                  {submitting || active ? <LoaderCircle className="animate-spin" size={17} /> : <Sparkles size={17} />}
                  {submitting ? "Queuing character…" : active ? selected?.stageLabel : "Generate Character"}
                </button>
              </form>

              <div className="scene-credit-card">
                <span><UserRound size={15} /></span>
                <p><b>2 generation stages</b><small>Geometry + 2K PBR textured static GLB · allowance {history?.quota ?? 10}/day</small></p>
              </div>
              <p className="character-accuracy-note">Static character asset. Rigging and animation are not included in this generation.</p>
              {history?.available === false ? <p className="scene-config-note"><AlertTriangle size={15} /> Setup required: {history.missingConfiguration.join(", ")}.</p> : null}
            </aside>

            <div className="scene-preview-panel">
              <SceneModelViewer src={selected?.modelUrl} poster={selected?.thumbnailUrl} prompt={selected?.prompt} kind="character" />
              <div className="scene-preview-meta">
                <div><small>SELECTED CHARACTER</small><b>{selected ? selected.prompt : "No generated character selected"}</b></div>
                <span className={`scene-status scene-status-${selected?.status || "idle"}`}>{selected?.stageLabel || "Waiting for direction"}</span>
              </div>
              {selected ? (
                <div className="scene-progress" aria-live="polite">
                  <div className="scene-progress-bar"><i style={{ width: `${selected.progress}%` }} /></div>
                  <div className="scene-stage-list">
                    {["Queued", "Sculpting character", "Painting materials", "Saving model", "Ready"].map((label, index) => (
                      <span className={selected.status === "failed" || selected.status === "review_required" ? "" : index <= stageIndex ? "done" : ""} key={label}>{index < stageIndex ? <Check size={11} /> : index === stageIndex && active ? <LoaderCircle className="animate-spin" size={11} /> : <i />}{label}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {error || selected?.error ? <p className="scene-error" role="alert"><AlertTriangle size={15} /> {error || selected?.error}</p> : null}
              <div className="scene-actions">
                <button type="button" onClick={() => selected && navigator.clipboard.writeText(selected.prompt)} disabled={!selected}><Clipboard size={14} /> Copy Prompt</button>
                <button type="button" onClick={() => selected && prepareAgain(selected)} disabled={!selected}><RefreshCw size={14} /> Generate Again</button>
                {selected?.downloadUrl ? <a href={selected.downloadUrl}><Download size={14} /> Download GLB</a> : <span><Download size={14} /> Download GLB</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="scene-history-section">
          <div className="scene-history-heading"><div><span>02 / CHARACTER LIBRARY</span><h2>My Characters</h2><p>Private to this browser until account authentication is added.</p></div><b>{history?.pagination.total ?? 0} SAVED</b></div>
          {loadingHistory ? <div className="scene-history-empty"><LoaderCircle className="animate-spin" size={20} /> Loading your characters…</div>
            : history?.items.length ? (
              <div className="scene-history-grid">
                {history.items.map((character) => (
                  <article className={selected?.id === character.id ? "selected" : ""} key={character.id}>
                    <button className="scene-history-preview" type="button" onClick={() => setSelected(character)} aria-label={`Open character: ${character.prompt}`}>
                      {character.thumbnailUrl ? <Image src={character.thumbnailUrl} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized /> : <span><UserRound size={30} /></span>}
                      <i>{character.stageLabel}</i>
                    </button>
                    <div className="scene-history-copy"><p>{character.prompt}</p><small><Clock3 size={11} /> {new Date(character.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small></div>
                    <div className="character-history-tags"><span>{character.settings.bodyPlan}</span><span>{character.settings.style}</span><span>{character.settings.pose}</span></div>
                    <div className="scene-history-actions"><button type="button" onClick={() => setSelected(character)}>Reopen</button>{!workingStatuses.has(character.status) ? <button type="button" onClick={() => void removeCharacter(character)} aria-label={`Delete character: ${character.prompt}`}><Trash2 size={14} /></button> : null}</div>
                  </article>
                ))}
              </div>
            ) : <div className="scene-history-empty"><UserRound size={22} /><p><b>No characters yet</b><small>Your completed and failed generations will appear here.</small></p></div>}
          {(history?.pagination.pages || 1) > 1 ? <div className="scene-pagination"><button type="button" disabled={page <= 1} onClick={() => { setLoadingHistory(true); setPage((value) => value - 1); }}><ChevronLeft size={15} /> Previous</button><span>Page {page} of {history?.pagination.pages}</span><button type="button" disabled={page >= (history?.pagination.pages || 1)} onClick={() => { setLoadingHistory(true); setPage((value) => value + 1); }}>Next <ChevronRight size={15} /></button></div> : null}
        </section>
      </main>
    </PageShell>
  );
}
