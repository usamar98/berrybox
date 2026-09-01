import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Bot,
  Box,
  Check,
  ChevronRight,
  Code2,
  Cpu,
  FolderOpen,
  Gamepad2,
  Gauge,
  Layers3,
  MousePointer2,
  Play,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { HeroPrompt } from "./hero-prompt";

const skills = [
  { icon: Sparkles, number: "01", title: "Prompt a world", copy: "Turn a short idea into a supported game configuration." },
  { icon: Blocks, number: "02", title: "Remix a template", copy: "Start from a playable structure instead of a blank scene." },
  { icon: SlidersHorizontal, number: "03", title: "Tune the rules", copy: "Adjust speed, enemies, collectibles, colors, and time." },
  { icon: MousePointer2, number: "04", title: "Play instantly", copy: "Move from an edit to a browser playtest without exporting." },
  { icon: FolderOpen, number: "05", title: "Save locally", copy: "Keep projects and return to them in the same browser." },
  { icon: Code2, number: "06", title: "Own the shape", copy: "Use manual controls whenever you want predictable results." },
];

const gallery = [
  { image: "/game-cards/moonlit-casefile.png", title: "Moonlit Casefile", type: "Narrative mystery", className: "bb-gallery-tall" },
  { image: "/game-cards/3d-world-explorer.png", title: "Wildwood Run", type: "3D exploration", className: "" },
  { image: "/game-cards/neon-orchard.png", title: "Neon Orchard", type: "Collectathon", className: "" },
  { image: "/game-cards/arcade-shooter.png", title: "Signal Breaker", type: "Arcade action", className: "bb-gallery-wide" },
  { image: "/game-cards/visual-novel.png", title: "After the Rain", type: "Visual novel", className: "" },
];

const faqs = [
  ["Does BerryBox generate a complete game from any prompt?", "Not yet. The alpha translates prompts into supported settings for BerryBox templates, including theme, color, movement, enemies, collectibles, and time. You can then refine everything with manual controls."],
  ["Do I need AI credits to use the builder?", "No. Templates, manual editing, saving, and playtesting work without AI. AI-assisted edits require a configured OpenAI API key and available API credit."],
  ["Where are my projects saved?", "Projects are stored locally in your browser in this alpha. They are not synced to the cloud, so clearing browser storage can remove them."],
  ["Can I publish or export my game?", "Publishing and connected exports are on the roadmap. Today you can create, save, and play your project inside BerryBox."],
  ["Is the 3D Character Creator available?", "The dedicated character creator is planned as a beta and is clearly marked coming soon. It is not part of the current alpha."],
  ["What runs the playable worlds?", "The live game preview is rendered in the browser with Three.js. The product interface is built with Next.js and React."],
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
            <p className="bb-kicker bb-hero-kicker"><span /> THE GAME CREATION WORKSPACE</p>
            <h1>Build the world.<br /><em>Play the idea.</em></h1>
            <p className="bb-hero-copy">
              BerryBox brings templates, AI-assisted setup, hands-on editing, and a playable 3D preview into one focused creator workspace.
            </p>
            <div className="bb-hero-actions">
              <Link href="/editor?template=explorer&new=1" className="bb-button bb-button-primary">
                Start building <ArrowRight size={17} />
              </Link>
              <Link href="/templates" className="bb-button bb-button-ghost">
                Explore templates
              </Link>
            </div>
            <HeroPrompt />
          </div>

          <div className="bb-shell bb-hero-product">
            <div className="bb-product-topbar">
              <div className="bb-window-dots"><i /><i /><i /></div>
              <span>mystic-forest.bb</span>
              <div className="bb-product-status"><span /> Autosaved locally</div>
            </div>
            <div className="bb-product-grid">
              <aside className="bb-product-sidebar">
                <div className="bb-mini-brand"><Box size={17} /> BerryBox</div>
                <div className="bb-file-label">PROJECT</div>
                {["World", "Gameplay", "Characters", "Assets", "Audio"].map((item, index) => (
                  <div className={index === 0 ? "bb-file active" : "bb-file"} key={item}>
                    <ChevronRight size={13} /> {item}
                  </div>
                ))}
                <div className="bb-file-label bb-file-spacer">SCENE</div>
                {["Forest floor", "Campfire", "Crystal_01", "Guard_01"].map((item) => (
                  <div className="bb-scene-file" key={item}><span /> {item}</div>
                ))}
              </aside>

              <div className="bb-product-stage">
                <div className="bb-stage-toolbar">
                  <div><button className="active">World</button><button>Gameplay</button><button>UI</button></div>
                  <div><button><Play size={13} /> Play</button><button className="publish">Save</button></div>
                </div>
                <div className="bb-stage-image">
                  <Image src="/game-cards/3d-world-explorer.png" alt="A BerryBox forest game scene" fill priority sizes="(max-width: 900px) 100vw, 65vw" />
                  <div className="bb-stage-tag bb-tag-one">Campfire</div>
                  <div className="bb-stage-tag bb-tag-two">Crystal</div>
                  <div className="bb-axis"><b>Y</b><span>X</span><i>Z</i></div>
                </div>
                <div className="bb-asset-bar">
                  <div className="bb-asset-label"><span>Assets</span><small>12 items</small></div>
                  <div className="bb-assets">
                    {["🌲", "🪨", "🔥", "📦", "⛺"].map((asset) => <button key={asset}>{asset}</button>)}
                    <button><Plus size={17} /></button>
                  </div>
                </div>
              </div>

              <aside className="bb-product-chat">
                <div className="bb-chat-title"><Bot size={17} /> Berry assistant <span>ALPHA</span></div>
                <div className="bb-chat-message user">Make the forest feel like dusk and add three guards.</div>
                <div className="bb-chat-message assistant">
                  <span><Sparkles size={13} /> Applied 4 changes</span>
                  Updated the time, palette, enemy count, and fog.
                </div>
                <div className="bb-change-list">
                  <div><Check size={12} /> theme <b>dusk</b></div>
                  <div><Check size={12} /> enemies <b>3</b></div>
                  <div><Check size={12} /> fog <b>enabled</b></div>
                </div>
                <div className="bb-chat-input">Ask for another change… <ArrowRight size={14} /></div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bb-section bb-skills" id="features">
          <div className="bb-shell">
            <SectionHeading eyebrow="START ANYWHERE" title="One workspace. Six ways forward." copy="Choose the part of game creation that matches your momentum, then move between them without losing the thread." />
            <div className="bb-skill-grid">
              {skills.map(({ icon: Icon, number, title, copy }) => (
                <article className="bb-skill-card" key={title}>
                  <div className="bb-skill-top"><Icon size={22} /><span>{number}</span></div>
                  <h3>{title}</h3><p>{copy}</p>
                  <ChevronRight className="bb-card-arrow" size={18} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-section bb-workspace-section" id="workspace">
          <div className="bb-shell">
            <SectionHeading eyebrow="THE CREATOR'S PLAYGROUND" title="Think, build, and play in one place." copy="A focused studio for shaping the idea and seeing the result. Every control is close to the world it changes." />
            <div className="bb-workspace-card">
              <div className="bb-workspace-copy">
                <span className="bb-number">01 / LIVE WORKSPACE</span>
                <h3>Your world stays in view.</h3>
                <p>Prompt the setup, edit the values, and playtest the scene without bouncing between disconnected tools.</p>
                <ul>
                  <li><Check size={15} /> Real-time 3D preview</li>
                  <li><Check size={15} /> AI plus manual controls</li>
                  <li><Check size={15} /> Browser-local project saves</li>
                </ul>
                <Link href="/editor?template=explorer&new=1">Open the workspace <ArrowRight size={16} /></Link>
              </div>
              <div className="bb-workspace-visual">
                <div className="bb-visual-tabs"><span className="active">Game</span><span>Scene</span><span>Settings</span></div>
                <Image src="/game-cards/moonlit-casefile.png" alt="Moonlit game scene in the BerryBox workspace" fill sizes="(max-width: 900px) 100vw, 58vw" />
                <button className="bb-play-button" aria-label="Play game preview"><Play fill="currentColor" size={21} /></button>
                <div className="bb-visual-caption"><small>ACTIVE SCENE</small><b>Moonlit Casefile</b><span>3 enemies · 8 crystals · dusk</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-section bb-capabilities">
          <div className="bb-shell">
            <SectionHeading eyebrow="BUILT FOR MOMENTUM" title="A small team of tools, working as one." />
            <div className="bb-bento">
              <article className="bb-bento-card bb-bento-featured">
                <div className="bb-bento-icon"><WandSparkles size={22} /></div>
                <p className="bb-bento-label">AI-ASSISTED CREATION</p>
                <h3>Describe the change.<br />Keep creative control.</h3>
                <p>BerryBox turns plain-language edits into validated game settings, then shows exactly what changed.</p>
                <div className="bb-code-block"><span>prompt</span><p>“Make it faster, darker, and add two guards.”</p><i>→ speed 7 · theme dusk · enemies 2</i></div>
              </article>
              <article className="bb-bento-card bb-bento-image">
                <Image src="/game-cards/neon-orchard.png" alt="A colorful BerryBox game world" fill sizes="(max-width: 900px) 100vw, 33vw" />
                <div className="bb-bento-overlay"><Gamepad2 size={22} /><h3>Playable by default</h3><p>Every current template starts with a real game loop.</p></div>
              </article>
              <article className="bb-bento-card bb-bento-small">
                <div className="bb-bento-icon"><Layers3 size={22} /></div><p className="bb-bento-label">TEMPLATES</p><h3>Structure before styling.</h3><p>Begin with a proven shape, then make it yours.</p>
              </article>
              <article className="bb-bento-card bb-bento-small">
                <div className="bb-bento-icon"><Gauge size={22} /></div><p className="bb-bento-label">FAST ITERATION</p><h3>Edit. Play. Repeat.</h3><p>Short feedback loops keep you close to the idea.</p>
              </article>
              <article className="bb-bento-card bb-bento-wide">
                <div><div className="bb-bento-icon"><ShieldCheck size={22} /></div><p className="bb-bento-label">PREDICTABLE OUTPUT</p><h3>AI suggestions stay inside the rules.</h3><p>Validated settings help the alpha remain playable while you experiment.</p></div>
                <div className="bb-validation-stack"><span><Check size={14} /> Schema checked</span><span><Check size={14} /> Values clamped</span><span><Check size={14} /> Manual fallback</span></div>
              </article>
            </div>
          </div>
        </section>

        <section className="bb-section bb-foundation">
          <div className="bb-shell">
            <SectionHeading eyebrow="UNDER THE HOOD" title="A practical foundation for playable ideas." copy="The current alpha uses focused, well-understood building blocks. No mystery benchmarks—just the systems running the experience today." />
            <div className="bb-foundation-grid">
              <article><span>01</span><Cpu size={27} /><h3>Three.js worlds</h3><p>Interactive 3D scenes rendered directly in the browser.</p></article>
              <article><span>02</span><Bot size={27} /><h3>OpenAI-assisted edits</h3><p>Natural-language requests mapped into supported settings.</p></article>
              <article><span>03</span><Code2 size={27} /><h3>Validated configs</h3><p>Structured project data designed for predictable playtests.</p></article>
            </div>
          </div>
        </section>

        <section className="bb-section bb-gallery" id="showcase">
          <div className="bb-shell">
            <div className="bb-heading-row">
              <SectionHeading eyebrow="WORLDS IN MOTION" title="A starting point for every kind of idea." />
              <Link href="/templates" className="bb-text-link">See all templates <ArrowRight size={16} /></Link>
            </div>
            <div className="bb-gallery-grid">
              {gallery.map((item) => (
                <Link href="/templates" className={`bb-gallery-card ${item.className}`} key={item.title}>
                  <Image src={item.image} alt={`${item.title} game artwork`} fill sizes="(max-width: 700px) 100vw, 40vw" />
                  <div className="bb-gallery-shade" />
                  <div className="bb-gallery-meta"><small>{item.type}</small><h3>{item.title}</h3><span><Play size={13} fill="currentColor" /> Explore</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-section bb-access" id="access">
          <div className="bb-shell">
            <SectionHeading eyebrow="EARLY ACCESS" title="Start free. Build what works." copy="The current alpha is an open workspace for testing the core creation loop. Future plans will arrive only when the connected features are ready." />
            <div className="bb-access-grid">
              <article className="featured">
                <div className="bb-release-status"><span /> AVAILABLE NOW</div>
                <h3>Alpha creator</h3>
                <div className="bb-price"><b>$0</b><span>while in alpha</span></div>
                <p>For exploring templates, building projects, and testing the BerryBox workflow.</p>
                <ul><li><Check size={14} /> Playable 3D templates</li><li><Check size={14} /> Manual game controls</li><li><Check size={14} /> Browser-local projects</li><li><Check size={14} /> AI-assisted edits with your API key</li></ul>
                <Link href="/templates" className="bb-button bb-button-primary">Start creating <ArrowRight size={16} /></Link>
              </article>
              <article>
                <div className="bb-release-status">PLANNED</div>
                <h3>Connected creator</h3>
                <div className="bb-price"><b>—</b><span>pricing not announced</span></div>
                <p>Future access for creators who need connected assets, characters, publishing, and sharing.</p>
                <ul><li><Check size={14} /> Connected project workflow</li><li><Check size={14} /> Character creation tools</li><li><Check size={14} /> Publishing and sharing</li><li><Check size={14} /> Cloud-backed projects</li></ul>
                <Link href="/workflow" className="bb-button bb-button-ghost">View the roadmap <ArrowRight size={16} /></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bb-section bb-roadmap" id="roadmap">
          <div className="bb-shell">
            <SectionHeading eyebrow="THE ROAD AHEAD" title="Three releases. One connected studio." copy="We are launching the core workflow in stages so every part has a clear purpose and an honest status." />
            <div className="bb-release-grid">
              <article className="active"><div className="bb-release-status"><span /> AVAILABLE NOW · ALPHA</div><h3>Templates + AI Builder</h3><p>Create and play supported 3D game templates, use manual controls, and ask AI for configuration edits.</p><Link href="/templates">Start creating <ArrowRight size={15} /></Link><b>01</b></article>
              <article><div className="bb-release-status">COMING SOON · BETA</div><h3>3D Character Creator</h3><p>Plan, preview, and refine original characters for future BerryBox worlds.</p><Link href="/characters">Preview the plan <ArrowRight size={15} /></Link><b>02</b></article>
              <article><div className="bb-release-status">COMING SOON</div><h3>Connected Workflow</h3><p>Bring worlds, characters, sharing, and publishing into one creator flow.</p><Link href="/workflow">See what’s next <ArrowRight size={15} /></Link><b>03</b></article>
            </div>
          </div>
        </section>

        <section className="bb-section bb-faq">
          <div className="bb-shell bb-faq-grid">
            <div><p className="bb-kicker">QUESTIONS, ANSWERED</p><h2>Clear now.<br />Ambitious next.</h2><p>BerryBox is an early product. Here is exactly what the current release can—and cannot—do.</p><Link href="/templates" className="bb-text-link">Try the alpha <ArrowRight size={16} /></Link></div>
            <div className="bb-accordion">
              {faqs.map(([question, answer], index) => (
                <details key={question} open={index === 0}>
                  <summary><span>0{index + 1}</span>{question}<Plus size={18} /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-final-cta">
          <div className="bb-orb bb-orb-three" />
          <div className="bb-shell">
            <div className="bb-final-mark"><Box size={31} /></div>
            <p className="bb-kicker">YOUR NEXT WORLD STARTS SMALL</p>
            <h2>Give the idea<br /><em>somewhere to play.</em></h2>
            <p>Open a template, shape the rules, and see what your game feels like.</p>
            <div><Link href="/editor?template=explorer&new=1" className="bb-button bb-button-primary">Build your first world <ArrowRight size={17} /></Link><Link href="/templates" className="bb-button bb-button-ghost">Browse templates</Link></div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
