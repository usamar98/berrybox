"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  CircleCheck,
  Cuboid,
  Download,
  ExternalLink,
  Film,
  Gamepad2,
  LoaderCircle,
  Lock,
  Rotate3D,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { SourceMediaCarousel } from "@/components/templates/source-media-carousel";

const ModelViewer = dynamic(() => import("@/components/3d/model-viewer"), {
  ssr: false,
  loading: () => <div className="bb-viewer-loading"><LoaderCircle className="animate-spin" size={22} /> Loading Three.js viewer…</div>,
});

type ProviderState = { available: boolean; provider: string; output: string; message: string };
type TaskState = {
  taskId: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "CANCELED";
  progress: number;
  modelUrl?: string;
};

const sources = [
  { label: "Poly Haven", meta: "CC0 3D models", href: "https://polyhaven.com/models", icon: Cuboid },
  { label: "Kenney", meta: "CC0 game assets", href: "https://kenney.nl/assets", icon: Gamepad2 },
  { label: "Pexels", meta: "Free source videos", href: "https://www.pexels.com/videos/", icon: Film },
];

export function TemplatesPage({ initialPrompt }: { initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt || "A modular ancient forest portal with mossy stone, low-poly edges, and game-ready proportions");
  const [provider, setProvider] = useState<ProviderState | null>(null);
  const [task, setTask] = useState<TaskState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const activeTaskId = task?.taskId;
  const activeTaskStatus = task?.status;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/3d/templates", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as ProviderState;
        if (!cancelled) setProvider(data);
      })
      .catch(() => { if (!cancelled) setProvider({ available: false, provider: "Meshy", output: "GLB", message: "Provider status is unavailable." }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeTaskId || activeTaskStatus === "SUCCEEDED" || activeTaskStatus === "FAILED" || activeTaskStatus === "CANCELED") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`/api/3d/templates/${encodeURIComponent(activeTaskId)}`, { cache: "no-store" });
        const data = await response.json() as TaskState & { error?: string };
        if (!response.ok) throw new Error(data.error || "Could not read the 3D task.");
        if (cancelled) return;
        setTask(data);
        if (data.status === "FAILED" || data.status === "CANCELED") setError("The 3D generation task did not complete. Try a simpler prompt or check provider credits.");
        else if (data.status !== "SUCCEEDED") timer = setTimeout(poll, 4_000);
      } catch (pollError) {
        if (!cancelled) {
          setError(pollError instanceof Error ? pollError.message : "The 3D task status is unavailable.");
          timer = setTimeout(poll, 8_000);
        }
      }
    };

    timer = setTimeout(poll, 2_000);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [activeTaskId, activeTaskStatus]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const idea = prompt.trim();
    if (idea.length < 8 || submitting) return;
    setSubmitting(true);
    setError("");
    setTask(null);
    try {
      const response = await fetch("/api/3d/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: idea }),
      });
      const data = await response.json() as { taskId?: string; status?: TaskState["status"]; error?: string };
      if (!response.ok || !data.taskId) throw new Error(data.error || "The 3D task could not be started.");
      setTask({ taskId: data.taskId, status: data.status || "PENDING", progress: 0 });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The 3D task could not be started.");
    } finally {
      setSubmitting(false);
    }
  }

  function useMediaPrompt(nextPrompt: string) {
    setPrompt(nextPrompt);
    document.getElementById("template-prompt")?.focus();
  }

  const working = task?.status === "PENDING" || task?.status === "IN_PROGRESS";

  return (
    <PageShell>
      <section className="bb-generator-page">
        <div className="bb-shell">
          <div className="bb-generator-heading">
            <Link href="/" className="bb-coming-back"><ArrowLeft size={15} /> Back to BerryBox</Link>
            <div>
              <p className="bb-kicker">AVAILABLE NOW · MESHY POWERED</p>
              <h1>AI 3D Template Generator</h1>
              <p>Describe one game-ready asset, generate a GLB, and inspect it in the built-in Three.js viewport.</p>
            </div>
            <span className={provider?.available ? "bb-generator-ready" : "bb-generator-ready waiting"}><i />{provider?.available ? "GENERATOR READY" : "VERCEL KEY REQUIRED"}</span>
          </div>

          <div className="bb-generator-shell">
            <aside className="bb-generator-sources">
              <div className="bb-generator-brand"><Box size={17} /> Sources</div>
              <p>FREE LIBRARIES</p>
              {sources.map(({ label, meta, href, icon: Icon }) => (
                <a href={href} target="_blank" rel="noreferrer" key={label}><Icon size={16} /><span><b>{label}</b><small>{meta}</small></span><ExternalLink size={12} /></a>
              ))}
              <div className="bb-source-license"><CircleCheck size={15} /><p><b>Source-aware</b><span>Poly Haven and Kenney are CC0. Pexels uses its own free-content license.</span></p></div>
            </aside>

            <div className="bb-generator-center">
              <div className="bb-generator-toolbar">
                <div><span className="active"><Rotate3D size={13} /> 3D View</span><span>GLB output</span></div>
                {task?.modelUrl ? <a href={task.modelUrl} target="_blank" rel="noreferrer"><Download size={13} /> Download GLB</a> : <span className="disabled"><Download size={13} /> Download GLB</span>}
              </div>
              <ModelViewer modelUrl={task?.modelUrl} />
              <SourceMediaCarousel onUsePrompt={useMediaPrompt} />
            </div>

            <aside className="bb-generator-prompt">
              <div className="bb-prompt-title"><Sparkles size={17} /><span><b>3D template agent</b><small>MESHY API</small></span></div>
              <form onSubmit={submit}>
                <label htmlFor="template-prompt">Describe one 3D template</label>
                <textarea id="template-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} minLength={8} maxLength={600} rows={8} placeholder="A modular fantasy gate with clean low-poly geometry…" />
                <div className="bb-prompt-tips"><span><Check size={12} /> Name one main object</span><span><Check size={12} /> Describe style and material</span><span><Check size={12} /> Mention game-ready proportions</span></div>
                <button type="submit" disabled={prompt.trim().length < 8 || submitting || working || provider?.available === false}>{submitting || working ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />}{submitting ? "Starting task…" : working ? `Generating ${task?.progress || 0}%` : "Generate 3D template"}</button>
              </form>

              <div className="bb-generation-status" aria-live="polite">
                {error ? <><AlertCircle size={16} /><p><b>Generation needs attention</b><span>{error}</span></p></>
                  : task?.status === "SUCCEEDED" ? <><CircleCheck size={16} /><p><b>GLB ready in the viewer</b><span>Orbit the model, then download it before the signed URL expires.</span></p></>
                  : working ? <><LoaderCircle className="animate-spin" size={16} /><p><b>Meshy is building the asset</b><span>Task {task.taskId.slice(0, 12)}… · {task.progress || 0}%</span></p></>
                  : <><Cuboid size={16} /><p><b>{provider?.provider || "Meshy"} · {provider?.output || "GLB"}</b><span>{provider?.message || "Checking provider configuration…"}</span></p></>}
              </div>
              <p className="bb-credit-note">Generation consumes provider credits and can take several minutes. The server key is never sent to the browser.</p>
            </aside>
          </div>

          <div className="bb-locked-products">
            <Link href="/characters"><UserRound size={21} /><div><span>COMING SOON</span><h2>Create a 3D character using a prompt</h2><p>Tripo generation, rigging, and animation pipeline.</p></div><Lock size={17} /></Link>
            <Link href="/workflow"><Gamepad2 size={21} /><div><span>COMING SOON</span><h2>Create a 3D game using a prompt</h2><p>OpenAI game specification plus a playable Three.js runtime.</p></div><Lock size={17} /></Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
