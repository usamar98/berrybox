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
    copy: "Generate an original textured humanoid, auto-rig it, preview its animation, and download the GLB or FBX.",
    status: "AVAILABLE NOW",
    href: "/characters",
    active: true,
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
  ["What can I generate right now?", "BerryBox can generate individual 3D template assets and original humanoid characters. Character output can include textured geometry, a humanoid rig, basic locomotion, and an animated GLB. Complete prompt-to-game generation remains coming soon."],
  ["Which formats do the generators return?", "Both live workflows return browser-ready GLB files. The character workflow also exposes FBX when the selected fal model provides a rigged or animated FBX export."],
  ["How do I see a generated model?", "BerryBox includes an interactive Three.js viewer. When the selected fal model finishes, the GLB opens in the viewport automatically and can be orbited, zoomed, panned, or downloaded."],
  ["Where is the generated model stored?", "fal returns a hosted asset URL from the selected model endpoint. BerryBox does not permanently store the model in this release, so download completed assets you want to keep."],
  ["Which external APIs are prepared?", "A single fal gateway powers configurable 3D model endpoints. Add compatible text-to-3D model IDs in Vercel without adding another browser-side provider integration."],
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
            <SectionHeading eyebrow="THREE CREATOR TOOLS" title="Two are live. One is next." copy="Generate standalone 3D assets or build an original rigged character today. Complete prompt-to-game generation is the next workflow." />
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
              <article><span>LIVE</span><Cuboid size={27} /><h3>fal.ai gateway</h3><p>One server-side key for queued 3D generation and normalized GLB output.</p></article>
              <article><span>LIVE</span><UserRound size={27} /><h3>Character pipeline</h3><p>Generate textured humanoids with pose control, automatic rigging, animation, and engine-friendly exports.</p></article>
              <article><span>CONFIGURABLE</span><Code2 size={27} /><h3>3D model catalog</h3><p>Add approved fal endpoints through Vercel while keeping every provider credential on the server.</p></article>
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
            <div><p className="bb-kicker">QUESTIONS, ANSWERED</p><h2>Focused now.<br />Built to grow.</h2><p>Template and character generation are live. The full prompt-to-game workflow remains clearly marked as coming soon.</p><Link href="/characters" className="bb-text-link">Create a character <ArrowRight size={16} /></Link></div>
            <div className="bb-accordion">
              {faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="bb-final-cta">
          <div className="bb-shell">
            <div className="bb-final-mark"><Box size={31} /></div>
            <p className="bb-kicker">THE LIVE BERRYBOX TOOLS</p>
            <h2>Describe the asset.<br /><em>Or create the hero.</em></h2>
            <p>Generate a standalone 3D template or an original rigged character and inspect the GLB in your browser.</p>
            <div><Link href="/characters" className="bb-button bb-button-primary">Create a character <ArrowRight size={17} /></Link><Link href="/templates" className="bb-button bb-button-ghost">Generate a template</Link></div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
