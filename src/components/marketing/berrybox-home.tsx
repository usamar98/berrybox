import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Box,
  Check,
  ChevronRight,
  Code2,
  Cuboid,
  Film,
  Gamepad2,
  Layers3,
  Lock,
  MousePointer2,
  Plus,
  Rotate3D,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { HeroPrompt } from "./hero-prompt";

const features = [
  {
    icon: Cuboid,
    number: "01",
    title: "Create a 3D game template using a prompt",
    copy: "Generate a web-ready GLB template asset, inspect it from every angle, and download the result.",
    status: "AVAILABLE NOW",
    href: "/templates",
    active: true,
  },
  {
    icon: UserRound,
    number: "02",
    title: "Create a 3D character using a prompt",
    copy: "A game-ready character pipeline for model generation, rigging, and animation is planned next.",
    status: "COMING SOON",
    href: "/characters",
    active: false,
  },
  {
    icon: Gamepad2,
    number: "03",
    title: "Create a 3D game using a prompt",
    copy: "A future workflow for generating structured game systems, scenes, and playable interactions.",
    status: "COMING SOON",
    href: "/workflow",
    active: false,
  },
];

const sources = [
  { image: "/game-cards/3d-world-explorer.png", title: "Poly Haven", type: "FREE CC0 3D MODELS", license: "CC0 source", href: "https://polyhaven.com/models", className: "bb-gallery-tall" },
  { image: "/game-cards/skyforge-isles.svg", title: "Kenney", type: "FREE CC0 GAME ASSETS", license: "CC0 source", href: "https://kenney.nl/assets", className: "" },
  { image: "/game-cards/ai-npc-story-game.png", title: "Pexels Videos", type: "FREE SOURCE VIDEO", license: "Pexels license", href: "https://www.pexels.com/videos/", className: "bb-gallery-wide" },
];

const faqs = [
  ["What can I generate right now?", "The enabled feature creates individual 3D template assets from a text prompt through Meshy. Character generation and complete prompt-to-game generation remain locked as coming soon."],
  ["Which format does the generator return?", "The current pipeline requests a GLB file, a compact glTF format suited to browsers and compatible with common 3D tools and game engines."],
  ["How do I see a generated model?", "BerryBox includes an interactive Three.js viewer. When Meshy finishes the task, the GLB opens in the viewport automatically and can be orbited, zoomed, panned, or downloaded."],
  ["Where is the generated model stored?", "Meshy returns a hosted, signed asset URL. BerryBox does not permanently store the model in this release, so download completed assets you want to keep."],
  ["Which external APIs are prepared?", "Meshy powers the enabled template generator. Tripo is selected for the future game-ready character pipeline, and OpenAI Structured Outputs is selected for the future game specification pipeline."],
  ["Are the source-library assets free?", "The linked Poly Haven and Kenney assets are CC0. Pexels videos use the Pexels license. Always review the current source license before shipping a commercial project."],
];

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="bb-section-heading">
      <p className="bb-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="bb-section-copy">{copy}</p> : null}
    </div>
  );
}

export function BerryBoxHome() {
  return (
    <PageShell>
      <div className="bb-home">
        <section className="bb-hero">
          <div className="bb-orb bb-orb-one" />
          <div className="bb-orb bb-orb-two" />
          <div className="bb-shell bb-hero-inner">
            <p className="bb-kicker bb-hero-kicker"><span /> AI 3D TEMPLATE GENERATOR</p>
            <h1>Create the asset.<br /><em>Build the world.</em></h1>
            <p className="bb-hero-copy">
              Describe a game-ready 3D template, generate a GLB asset, and inspect it in an interactive browser viewport.
            </p>
            <div className="bb-hero-actions">
              <Link href="/templates" className="bb-button bb-button-primary">Generate a 3D template <ArrowRight size={17} /></Link>
              <a href="#features" className="bb-button bb-button-ghost">View all features</a>
            </div>
            <HeroPrompt />
          </div>

          <div className="bb-shell bb-hero-product">
            <div className="bb-product-topbar">
              <div className="bb-window-dots"><i /><i /><i /></div>
              <span>ancient-forest-portal.glb</span>
              <div className="bb-product-status"><span /> Viewer ready</div>
            </div>
            <div className="bb-product-grid">
              <aside className="bb-product-sidebar">
                <div className="bb-mini-brand"><Box size={17} /> BerryBox</div>
                <div className="bb-file-label">GENERATOR</div>
                {["Prompt", "Shape", "Materials", "Topology", "Export"].map((item, index) => (
                  <div className={index === 0 ? "bb-file active" : "bb-file"} key={item}><ChevronRight size={13} /> {item}</div>
                ))}
                <div className="bb-file-label bb-file-spacer">OUTPUT</div>
                {["Template mesh", "PBR material", "GLB package"].map((item) => <div className="bb-scene-file" key={item}><span /> {item}</div>)}
              </aside>

              <div className="bb-product-stage">
                <div className="bb-stage-toolbar">
                  <div><button className="active">3D view</button><button>Wireframe</button><button>Materials</button></div>
                  <div><button><Rotate3D size={13} /> Orbit</button><button className="publish">Download GLB</button></div>
                </div>
                <div className="bb-stage-image">
                  <Image src="/game-cards/3d-world-explorer.png" alt="A generated BerryBox 3D template concept" fill priority sizes="(max-width: 900px) 100vw, 65vw" />
                  <div className="bb-stage-tag bb-tag-one">Template mesh</div>
                  <div className="bb-stage-tag bb-tag-two">PBR material</div>
                  <div className="bb-axis"><b>Y</b><span>X</span><i>Z</i></div>
                </div>
                <div className="bb-asset-bar">
                  <div className="bb-asset-label"><span>Free sources + 3D templates</span><small>Ready to explore</small></div>
                  <div className="bb-assets bb-source-assets">
                    <button title="Generated 3D templates"><Cuboid size={19} /><small>3D templates</small></button>
                    <button title="Poly Haven CC0 models"><Layers3 size={19} /><small>CC0 models</small></button>
                    <button title="Kenney game assets"><Gamepad2 size={19} /><small>Game assets</small></button>
                    <button title="Pexels source video"><Film size={19} /><small>Source video</small></button>
                    <button aria-label="Add source"><Plus size={17} /></button>
                  </div>
                </div>
              </div>

              <aside className="bb-product-chat">
                <div className="bb-chat-title"><Bot size={17} /> 3D template agent <span>LIVE</span></div>
                <div className="bb-chat-message user">A modular ancient forest portal, game-ready, low-poly edges, mossy stone.</div>
                <div className="bb-chat-message assistant"><span><Sparkles size={13} /> Generation ready</span>Prepared a web-friendly template request and GLB output.</div>
                <div className="bb-change-list"><div><Check size={12} /> format <b>GLB</b></div><div><Check size={12} /> topology <b>remeshed</b></div><div><Check size={12} /> viewer <b>Three.js</b></div></div>
                <div className="bb-chat-input">Describe another 3D template… <ArrowRight size={14} /></div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bb-section bb-skills" id="features">
          <div className="bb-shell">
            <SectionHeading eyebrow="THREE CREATOR TOOLS" title="One is live. Two are next." copy="BerryBox is focused on three prompt-based 3D workflows. Only template generation is enabled in this release." />
            <div className="bb-skill-grid bb-three-features">
              {features.map(({ icon: Icon, number, title, copy, status, href, active }) => (
                <Link className={active ? "bb-skill-card bb-feature-live" : "bb-skill-card bb-feature-locked"} href={href} key={title}>
                  <div className="bb-skill-top"><Icon size={23} /><span>{number}</span></div>
                  <div className="bb-feature-status">{active ? <span /> : <Lock size={11} />}{status}</div>
                  <h3>{title}</h3><p>{copy}</p><ChevronRight className="bb-card-arrow" size={18} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-section bb-workspace-section" id="workspace">
          <div className="bb-shell">
            <SectionHeading eyebrow="PROMPT TO GLB" title="Generate, inspect, and download in one place." copy="The live workspace follows the editor layout in your reference: sources on the left, a large 3D viewport in the center, and generation status on the right." />
            <div className="bb-workspace-card">
              <div className="bb-workspace-copy">
                <span className="bb-number">01 / INTERACTIVE VIEWER</span>
                <h3>Your model stays in view.</h3>
                <p>When generation succeeds, BerryBox loads the returned GLB directly into a real-time Three.js viewport.</p>
                <ul><li><Check size={15} /> Orbit, pan, and zoom</li><li><Check size={15} /> Automatic model framing</li><li><Check size={15} /> Direct GLB download</li></ul>
                <Link href="/templates">Open the generator <ArrowRight size={16} /></Link>
              </div>
              <div className="bb-workspace-visual">
                <div className="bb-visual-tabs"><span className="active">3D model</span><span>Wireframe</span><span>Materials</span></div>
                <Image src="/game-cards/3d-world-explorer.png" alt="3D template in the BerryBox model workspace" fill sizes="(max-width: 900px) 100vw, 58vw" />
                <button className="bb-play-button" aria-label="Open 3D model generator"><MousePointer2 size={21} /></button>
                <div className="bb-visual-caption"><small>GENERATED TEMPLATE</small><b>Ancient Forest Portal</b><span>GLB · PBR · game-ready topology</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-section bb-foundation">
          <div className="bb-shell">
            <SectionHeading eyebrow="PROVIDER FOUNDATION" title="The right API for each 3D job." copy="Keys stay server-side and can be added in Vercel. The interface exposes only readiness—not credentials." />
            <div className="bb-foundation-grid">
              <article><span>LIVE</span><Cuboid size={27} /><h3>Meshy API</h3><p>Enabled for prompt-to-3D template generation and GLB output.</p></article>
              <article><span>SOON</span><UserRound size={27} /><h3>Tripo API</h3><p>Selected for the future game-ready character, rigging, and animation pipeline.</p></article>
              <article><span>SOON</span><Code2 size={27} /><h3>OpenAI Responses</h3><p>Selected for future validated game specifications and system planning.</p></article>
            </div>
          </div>
        </section>

        <section className="bb-section bb-gallery" id="sources">
          <div className="bb-shell">
            <div className="bb-heading-row">
              <SectionHeading eyebrow="FREE SOURCE SHELF" title="3D models, game assets, and video references." />
              <p className="bb-source-note">External libraries · Review source licenses before shipping</p>
            </div>
            <div className="bb-gallery-grid bb-source-grid">
              {sources.map((item) => (
                <a href={item.href} target="_blank" rel="noreferrer" className={`bb-gallery-card ${item.className}`} key={item.title}>
                  <Image src={item.image} alt={`${item.title} source-library artwork`} fill sizes="(max-width: 700px) 100vw, 40vw" />
                  <div className="bb-gallery-shade" />
                  <div className="bb-gallery-meta"><small>{item.type}</small><h3>{item.title}</h3><span>{item.title === "Pexels Videos" ? <Film size={13} /> : <Cuboid size={13} />} {item.license} <ArrowRight size={13} /></span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-section bb-faq">
          <div className="bb-shell bb-faq-grid">
            <div><p className="bb-kicker">QUESTIONS, ANSWERED</p><h2>Focused now.<br />Built to grow.</h2><p>The product status is intentionally clear: template generation is live; character and full-game generation are not enabled yet.</p><Link href="/templates" className="bb-text-link">Generate a template <ArrowRight size={16} /></Link></div>
            <div className="bb-accordion">
              {faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="bb-final-cta">
          <div className="bb-shell">
            <div className="bb-final-mark"><Box size={31} /></div>
            <p className="bb-kicker">THE LIVE BERRYBOX TOOL</p>
            <h2>Describe the asset.<br /><em>See it in 3D.</em></h2>
            <p>Generate a template asset and inspect the GLB in your browser.</p>
            <div><Link href="/templates" className="bb-button bb-button-primary">Open 3D generator <ArrowRight size={17} /></Link><a href="#sources" className="bb-button bb-button-ghost">Browse free sources</a></div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
