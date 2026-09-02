"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, Box, Check, ChevronLeft, ChevronRight, Clipboard, Clock3, Download, LoaderCircle, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import type { PublicScene } from "@/lib/3d-scenes/types";
import { SceneModelViewer } from "./scene-model-viewer";

const examples = [
  "A small floating island with a wooden cottage, pine trees, and rocks, stylized low-poly diorama.",
  "A cozy miniature reading corner with an armchair, bookshelf, rug, and potted plant.",
  "A tiny desert oasis with palm trees, sandstone rocks, and a small pool, stylized game-art scene.",
];

type HistoryResponse = {
  available: boolean;
  provider: string;
  output: string;
  model: string;
  quota: number;
  missingConfiguration: string[];
  items: PublicScene[];
  pagination: { page: number; pageSize: number; total: number; pages: number };
};

const workingStatuses = new Set(["queued", "processing"]);

async function fetchHistoryPage(page: number) {
  const response = await fetch(`/api/3d-scenes?page=${page}`, { cache: "no-store" });
  const data = await response.json() as HistoryResponse & { error?: string };
  if (!response.ok) throw new Error(data.error || "Scene history could not be loaded.");
  return data;
}

export function SceneGeneratorPage({ initialPrompt = "" }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt.trim().slice(0, 600) || examples[0]);
  const [selected, setSelected] = useState<PublicScene>();
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
      setError(requestError instanceof Error ? requestError.message : "Scene history could not be loaded.");
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
      setError(requestError instanceof Error ? requestError.message : "Scene history could not be loaded.");
      setLoadingHistory(false);
    });
    return () => { active = false; };
  }, [page]);

  useEffect(() => {
    if (!selected || !workingStatuses.has(selected.status)) return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/3d-scenes/${selected.id}`, { cache: "no-store" });
        const data = await response.json() as { scene?: PublicScene; error?: string };
        if (!response.ok || !data.scene) throw new Error(data.error || "Scene status could not be refreshed.");
        setSelected(data.scene);
        if (!workingStatuses.has(data.scene.status)) void loadHistory(page, true);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Scene status could not be refreshed.");
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
      const response = await fetch("/api/3d-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), submissionKey: crypto.randomUUID() }),
      });
      const data = await response.json() as { scene?: PublicScene; error?: string };
      if (!response.ok || !data.scene) throw new Error(data.error || "The scene could not be queued.");
      setSelected(data.scene);
      setPage(1);
      await loadHistory(1, true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The scene could not be queued.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeScene(scene: PublicScene) {
    if (!window.confirm("Delete this scene and its stored files?")) return;
    setError("");
    const response = await fetch(`/api/3d-scenes/${scene.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setError(data.error || "The scene could not be deleted.");
      return;
    }
    if (selected?.id === scene.id) setSelected(undefined);
    await loadHistory(page);
  }

  return (
    <PageShell>
      <main className="scene-generator-page">
        <section className="scene-generator-hero">
          <div className="scene-generator-heading">
            <span><Sparkles size={14} /> AI SCENE LAB / ACTIVE</span>
            <h1>AI 3D Scene Generator</h1>
            <p>Describe a small 3D scene. Generate, explore, and download your model.</p>
          </div>

          <div className="scene-workspace">
            <aside className="scene-prompt-panel">
              <div className="scene-panel-kicker"><span>01</span><p><b>Direct the scene</b><small>Prompt-only · sensible defaults</small></p></div>
              <form onSubmit={submit}>
                <label htmlFor="scene-prompt">Describe a compact scene</label>
                <textarea id="scene-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} minLength={12} maxLength={600} rows={8} disabled={submitting || active} />
                <div className="scene-character-count"><span>Small dioramas produce the clearest result.</span><b>{prompt.length} / 600</b></div>
                <div className="scene-example-chips" aria-label="Example scene prompts">
                  {examples.map((example, index) => <button type="button" key={example} onClick={() => setPrompt(example)} disabled={submitting || active}>Example {String(index + 1).padStart(2, "0")}</button>)}
                </div>
                <button className="scene-generate-button" type="submit" disabled={prompt.trim().length < 12 || submitting || active || history?.available === false}>
                  {submitting || active ? <LoaderCircle className="animate-spin" size={17} /> : <Sparkles size={17} />}
                  {submitting ? "Queuing scene…" : active ? selected?.stageLabel : "Generate Scene"}
                </button>
              </form>

              <div className="scene-credit-card">
                <span><Box size={15} /></span>
                <p><b>2 generation stages</b><small>Geometry + textured PBR GLB · daily browser allowance {history?.quota ?? 3}</small></p>
              </div>
              {history?.available === false ? <p className="scene-config-note"><AlertTriangle size={15} /> Setup required: {history.missingConfiguration.join(", ")}.</p> : null}
            </aside>

            <div className="scene-preview-panel">
              <SceneModelViewer src={selected?.modelUrl} poster={selected?.thumbnailUrl} prompt={selected?.prompt} />
              <div className="scene-preview-meta">
                <div><small>SELECTED SCENE</small><b>{selected ? selected.prompt : "No generated scene selected"}</b></div>
                <span className={`scene-status scene-status-${selected?.status || "idle"}`}>{selected?.stageLabel || "Waiting for direction"}</span>
              </div>
              {selected ? (
                <div className="scene-progress" aria-live="polite">
                  <div className="scene-progress-bar"><i style={{ width: `${selected.progress}%` }} /></div>
                  <div className="scene-stage-list">
                    {["Queued", "Creating geometry", "Adding textures", "Saving model", "Ready"].map((label, index) => (
                      <span className={selected.status === "failed" || selected.status === "review_required" ? "" : index <= stageIndex ? "done" : ""} key={label}>{index < stageIndex ? <Check size={11} /> : index === stageIndex && active ? <LoaderCircle className="animate-spin" size={11} /> : <i />}{label}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {error || selected?.error ? <p className="scene-error" role="alert"><AlertTriangle size={15} /> {error || selected?.error}</p> : null}
              <div className="scene-actions">
                <button type="button" onClick={() => selected && navigator.clipboard.writeText(selected.prompt)} disabled={!selected}><Clipboard size={14} /> Copy Prompt</button>
                <button type="button" onClick={() => selected && setPrompt(selected.prompt)} disabled={!selected}><RefreshCw size={14} /> Generate Again</button>
                {selected?.downloadUrl ? <a href={selected.downloadUrl}><Download size={14} /> Download GLB</a> : <span><Download size={14} /> Download GLB</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="scene-history-section">
          <div className="scene-history-heading"><div><span>02 / LIBRARY</span><h2>My Scenes</h2><p>Private to this browser until account authentication is added.</p></div><b>{history?.pagination.total ?? 0} SAVED</b></div>
          {loadingHistory ? <div className="scene-history-empty"><LoaderCircle className="animate-spin" size={20} /> Loading your scenes…</div>
            : history?.items.length ? (
              <div className="scene-history-grid">
                {history.items.map((scene) => (
                  <article className={selected?.id === scene.id ? "selected" : ""} key={scene.id}>
                    <button className="scene-history-preview" type="button" onClick={() => setSelected(scene)} aria-label={`Open scene: ${scene.prompt}`}>
                      {scene.thumbnailUrl ? <Image src={scene.thumbnailUrl} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized /> : <span><Box size={30} /></span>}
                      <i>{scene.stageLabel}</i>
                    </button>
                    <div className="scene-history-copy"><p>{scene.prompt}</p><small><Clock3 size={11} /> {new Date(scene.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small></div>
                    <div className="scene-history-actions"><button type="button" onClick={() => setSelected(scene)}>Reopen</button>{!workingStatuses.has(scene.status) ? <button type="button" onClick={() => void removeScene(scene)} aria-label={`Delete scene: ${scene.prompt}`}><Trash2 size={14} /></button> : null}</div>
                  </article>
                ))}
              </div>
            ) : <div className="scene-history-empty"><Box size={22} /><p><b>No scenes yet</b><small>Your completed and failed generations will appear here.</small></p></div>}
          {(history?.pagination.pages || 1) > 1 ? <div className="scene-pagination"><button type="button" disabled={page <= 1} onClick={() => { setLoadingHistory(true); setPage((value) => value - 1); }}><ChevronLeft size={15} /> Previous</button><span>Page {page} of {history?.pagination.pages}</span><button type="button" disabled={page >= (history?.pagination.pages || 1)} onClick={() => { setLoadingHistory(true); setPage((value) => value + 1); }}>Next <ChevronRight size={15} /></button></div> : null}
        </section>
      </main>
    </PageShell>
  );
}
