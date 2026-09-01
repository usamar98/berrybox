"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  CircleCheck,
  Download,
  Layers3,
  LoaderCircle,
  Palette,
  Play,
  Rotate3D,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";

const ModelViewer = dynamic(() => import("@/components/3d/model-viewer"), {
  ssr: false,
  loading: () => <div className="bb-viewer-loading"><LoaderCircle className="animate-spin" size={22} /> Loading character viewport…</div>,
});

type ProviderState = {
  available: boolean;
  provider: string;
  output: string;
  message: string;
  defaultModel: string;
  models: Array<{ id: string; label: string }>;
};

type CharacterTask = {
  taskId: string;
  model: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress: number;
  modelUrl?: string;
  riggedModelUrl?: string;
  animationUrl?: string;
  fbxUrl?: string;
  rigged?: boolean;
  animated?: boolean;
};

const presets = [
  {
    name: "Berry Vanguard",
    meta: "Stylized hero · plated cloth",
    className: "vanguard",
    prompt: "An original stylized berry-themed female vanguard hero, athletic humanoid proportions, magenta layered armor over dark cloth, short practical hair, expressive face, clearly separated arms and legs, clean game-ready silhouette, full body, no weapons, A-pose",
  },
  {
    name: "Forest Scout",
    meta: "Fantasy ranger · organic gear",
    className: "scout",
    prompt: "An original agile forest scout character, stylized fantasy game art, moss green travel cloak, light leather armor, utility belt, boots and gloves, clearly visible hands and limbs, friendly determined face, full body, clean game-ready proportions, A-pose",
  },
  {
    name: "Neon Mechanic",
    meta: "Sci-fi NPC · hard surface",
    className: "mechanic",
    prompt: "An original sci-fi mechanic NPC, compact humanoid silhouette, charcoal utility suit with berry-pink luminous trim, modular shoulder pads, tool belt, uncovered face, clearly separated arms and legs, stylized production-ready game character, full body, A-pose",
  },
] as const;

export function CharacterPage() {
  const [prompt, setPrompt] = useState<string>(presets[0].prompt);
  const [provider, setProvider] = useState<ProviderState | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [poseMode, setPoseMode] = useState<"a-pose" | "t-pose">("a-pose");
  const [modelType, setModelType] = useState<"standard" | "lowpoly">("standard");
  const [heightMeters, setHeightMeters] = useState(1.7);
  const [animate, setAnimate] = useState(true);
  const [task, setTask] = useState<CharacterTask | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const activeTaskId = task?.taskId;
  const activeTaskModel = task?.model;
  const activeTaskStatus = task?.status;
  const working = activeTaskStatus === "PENDING" || activeTaskStatus === "IN_PROGRESS";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/3d/characters", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as ProviderState;
        if (!cancelled) {
          setProvider(data);
          setSelectedModel((current) => current || data.defaultModel);
        }
      })
      .catch(() => {
        if (!cancelled) setProvider({ available: false, provider: "fal.ai", output: "Rigged GLB", message: "Character provider status is unavailable.", defaultModel: "", models: [] });
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeTaskId || !activeTaskModel || activeTaskStatus === "SUCCEEDED" || activeTaskStatus === "FAILED" || activeTaskStatus === "CANCELED") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`/api/3d/characters/${encodeURIComponent(activeTaskId)}?model=${encodeURIComponent(activeTaskModel)}`, { cache: "no-store" });
        const data = await response.json() as CharacterTask & { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not read the character task.");
        if (cancelled) return;
        setTask(data);
        if (data.status === "FAILED" || data.status === "CANCELED") setError("The character task did not complete. Try a clearer humanoid prompt or check fal credits.");
        else if (data.status !== "SUCCEEDED") timer = setTimeout(poll, 4_000);
      } catch (pollError) {
        if (!cancelled) {
          setError(pollError instanceof Error ? pollError.message : "Character task status is unavailable.");
          timer = setTimeout(poll, 8_000);
        }
      }
    };

    timer = setTimeout(poll, 2_000);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [activeTaskId, activeTaskModel, activeTaskStatus]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const idea = prompt.trim();
    if (idea.length < 12 || !selectedModel || submitting || working) return;
    setSubmitting(true);
    setError("");
    setTask(null);
    try {
      const response = await fetch("/api/3d/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: idea, model: selectedModel, poseMode, modelType, heightMeters, animate }),
      });
      const data = await response.json() as { taskId?: string; model?: string; status?: CharacterTask["status"]; error?: string };
      if (!response.ok || !data.taskId) throw new Error(data.error || "The character task could not be started.");
      setTask({ taskId: data.taskId, model: data.model || selectedModel, status: data.status || "PENDING", progress: 0 });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The character task could not be started.");
    } finally {
      setSubmitting(false);
    }
  }

  const pipelineStep = working ? (task?.progress || 5) > 65 ? 4 : (task?.progress || 5) > 35 ? 3 : 2 : task?.status === "SUCCEEDED" ? 6 : 1;

  return (
    <PageShell>
      <section className="bb-character-page">
        <div className="bb-shell">
          <div className="bb-character-heading">
            <Link href="/" className="bb-coming-back"><ArrowLeft size={15} /> Back to BerryBox</Link>
            <div>
              <p className="bb-kicker">AVAILABLE NOW · RIGGED CHARACTER PIPELINE</p>
              <h1>3D Character Creator</h1>
              <p>Describe an original hero or NPC, generate textured geometry, auto-rig the humanoid, and preview the animated GLB in your browser.</p>
            </div>
            <span className={provider?.available ? "bb-generator-ready" : "bb-generator-ready waiting"}><i />{provider?.available ? "CHARACTER LAB READY" : "VERCEL KEY REQUIRED"}</span>
          </div>

          <div className="bb-character-studio">
            <aside className="bb-character-rail">
              <div className="bb-generator-brand"><UserRound size={17} /> Persona lab</div>
              <p>BUILD PIPELINE</p>
              <ol className="bb-character-pipeline">
                {["Prompt", "Sculpt", "Materials", "Rig", "Motion"].map((label, index) => (
                  <li className={index + 1 < pipelineStep ? "done" : index + 1 === pipelineStep ? "active" : ""} key={label}>
                    <span>{index + 1 < pipelineStep ? <Check size={11} /> : `0${index + 1}`}</span><b>{label}</b><i />
                  </li>
                ))}
              </ol>
              <p>STARTING PERSONAS</p>
              <div className="bb-character-presets">
                {presets.map((preset) => (
                  <button type="button" key={preset.name} onClick={() => setPrompt(preset.prompt)}>
                    <span className={`bb-preset-orb ${preset.className}`}><UserRound size={18} /></span>
                    <span><b>{preset.name}</b><small>{preset.meta}</small></span>
                  </button>
                ))}
              </div>
              <div className="bb-character-capability"><Sparkles size={15} /><p><b>One prompt, full character</b><span>Textured GLB, humanoid skeleton, and motion-ready output through fal.</span></p></div>
            </aside>

            <div className="bb-character-stage">
              <div className="bb-generator-toolbar">
                <div><span className="active"><Rotate3D size={13} /> Character view</span><span><Activity size={13} /> Animation preview</span></div>
                <div className="bb-character-downloads">
                  {task?.modelUrl ? <a href={task.modelUrl} target="_blank" rel="noreferrer"><Download size={13} /> GLB</a> : <span className="disabled"><Download size={13} /> GLB</span>}
                  {task?.fbxUrl ? <a href={task.fbxUrl} target="_blank" rel="noreferrer"><Download size={13} /> FBX</a> : null}
                </div>
              </div>
              <ModelViewer modelUrl={task?.modelUrl} variant="character" />
              <div className="bb-character-inspector">
                <div><small>CHARACTER BUILD</small><b>{task?.status === "SUCCEEDED" ? "Generated persona" : "Original game-ready humanoid"}</b></div>
                <div className="bb-character-chips"><span><Layers3 size={12} /> {modelType}</span><span><UserRound size={12} /> {poseMode.toUpperCase()}</span><span><Palette size={12} /> PBR</span><span><Activity size={12} /> {animate ? "motion" : "rig only"}</span></div>
                <div className="bb-character-output-grid">
                  <span><small>FORMAT</small><b>GLB</b></span>
                  <span><small>HEIGHT</small><b>{heightMeters.toFixed(1)}m</b></span>
                  <span><small>SKELETON</small><b>{task?.rigged ? "READY" : "AUTO"}</b></span>
                  <span><small>CLIP</small><b>{task?.animated ? "PLAYING" : animate ? "IDLE" : "OFF"}</b></span>
                </div>
              </div>
            </div>

            <aside className="bb-character-controls">
              <div className="bb-prompt-title"><SlidersHorizontal size={17} /><span><b>Character director</b><small>FAL LIVE</small></span></div>
              <form onSubmit={submit}>
                <label htmlFor="character-model">Generation model</label>
                <select id="character-model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} disabled={!provider?.models.length || working || submitting}>
                  {provider?.models.length ? provider.models.map((model) => <option value={model.id} key={model.id}>{model.label}</option>) : <option value="">No fal model configured</option>}
                </select>

                <label htmlFor="character-prompt">Describe the character</label>
                <textarea id="character-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} minLength={12} maxLength={600} rows={7} placeholder="An original stylized game hero with a clear humanoid silhouette…" />

                <div className="bb-character-control-grid">
                  <label>Rig pose<select aria-label="Rig pose" value={poseMode} onChange={(event) => setPoseMode(event.target.value as "a-pose" | "t-pose")}><option value="a-pose">A-pose</option><option value="t-pose">T-pose</option></select></label>
                  <label>Geometry<select aria-label="Geometry style" value={modelType} onChange={(event) => setModelType(event.target.value as "standard" | "lowpoly")}><option value="standard">Detailed</option><option value="lowpoly">Low-poly</option></select></label>
                </div>

                <label htmlFor="character-height" className="bb-character-range-label"><span>Character height</span><b>{heightMeters.toFixed(1)} m</b></label>
                <input id="character-height" type="range" min="1.2" max="2.4" step="0.1" value={heightMeters} onChange={(event) => setHeightMeters(Number(event.target.value))} />

                <label className="bb-character-toggle"><input type="checkbox" checked={animate} onChange={(event) => setAnimate(event.target.checked)} /><span><Play size={13} /></span><p><b>Motion-ready export</b><small>Add an idle clip plus the rigging locomotion pack.</small></p></label>

                <div className="bb-prompt-tips"><span><Check size={12} /> Use an original humanoid design</span><span><Check size={12} /> Keep limbs clearly separated</span><span><Check size={12} /> Describe clothing and materials</span></div>
                <button type="submit" disabled={prompt.trim().length < 12 || !selectedModel || submitting || working || provider?.available === false}>{submitting || working ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}{submitting ? "Starting character…" : working ? `Building ${task?.progress || 0}%` : "Generate 3D character"}</button>
              </form>

              <div className="bb-generation-status" aria-live="polite">
                {error ? <><AlertCircle size={16} /><p><b>Character needs attention</b><span>{error}</span></p></>
                  : task?.status === "SUCCEEDED" ? <><CircleCheck size={16} /><p><b>Character ready in the viewer</b><span>{task.rigged ? "Rigged" : "Generated"}{task.animated ? " · animation playing" : ""} · download before the signed URL expires.</span></p></>
                  : working && task ? <><LoaderCircle className="animate-spin" size={16} /><p><b>fal is building the character</b><span>Task {task.taskId.slice(0, 12)}… · {task.progress || 0}%</span></p></>
                  : <><Box size={16} /><p><b>{provider?.provider || "fal.ai"} · {provider?.output || "Rigged GLB"}</b><span>{provider?.message || "Checking character pipeline…"}</span></p></>}
              </div>
              <p className="bb-credit-note">Character generation consumes fal credits and can take several minutes. BerryBox never sends your fal key to the browser.</p>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
