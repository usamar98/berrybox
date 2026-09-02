import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cuboid,
  ExternalLink,
  Film,
  Gamepad2,
  Layers3,
  Lock,
  UserRound,
} from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { HeroPrompt } from "./hero-prompt";

const features = [
  {
    icon: Layers3,
    number: "01",
    title: "AI 3D Scene Generator",
    copy: "Compose environments, lighting, props, and spatial direction from one clear scene brief.",
    status: "ACTIVE",
    active: true,
    image: "/game-cards/3d-world-explorer.png",
    imageAlt: "Floating fantasy world used as an AI 3D scene concept",
    href: "/ai-3d-scene-generator",
  },
  {
    icon: UserRound,
    number: "02",
    title: "AI 3D Character Generator",
    copy: "Shape original textured heroes with silhouette, style, pose, and animation direction.",
    status: "COMING SOON",
    active: false,
    image: "/creator-media/character-generator.jpg",
    imageAlt: "Skyfall Heroes warrior cover artwork",
  },
  {
    icon: Cuboid,
    number: "03",
    title: "AI 3D Game Template Generator",
    copy: "Turn a game idea into a reusable 3D world template with structured assets and systems.",
    status: "COMING SOON",
    active: false,
    image: "/creator-media/template-generator.jpg",
    imageAlt: "Aether's Fall action RPG cover artwork",
  },
  {
    icon: Gamepad2,
    number: "04",
    title: "AI 3D Game Generator",
    copy: "Generate a complete playable 3D experience from a single creative direction.",
    status: "COMING SOON",
    active: false,
    image: "/creator-media/game-generator.jpg",
    imageAlt: "Love's Horizon story game cover artwork",
  },
];

const heroImageColumns = [
  [
    "/creator-media/showcase-qubo-explorer.jpg",
    "/creator-media/showcase-chronicles-empire.jpg",
  ],
  [
    "/creator-media/showcase-shattered-dimension.jpg",
    "/creator-media/showcase-geometrix.jpg",
  ],
];

const motionStories = [
  {
    number: "01",
    title: "Forge the encounter",
    copy: "Cinematic motion reference for combat, environments, and moment-to-moment game feel.",
    video: "/creator-media/world-motion-01.mp4",
    href: "https://grok.com/imagine/post/eabcf470-58fd-4def-a82e-3eb9cd7fea31",
    concepts: [
      {
        title: "Qubo Explorer",
        image: "/creator-media/showcase-qubo-explorer.jpg",
        alt: "Qubo Explorer 3D puzzle adventure cover artwork",
      },
      {
        title: "Chronicles of Empire",
        image: "/creator-media/showcase-chronicles-empire.jpg",
        alt: "Chronicles of Empire fantasy warfare cover artwork",
      },
      {
        title: "Byte Runner",
        image: "/game-cards/byte-runner.png",
        alt: "Byte Runner neon pixel platform game artwork",
      },
      {
        title: "3D World Explorer",
        image: "/game-cards/3d-world-explorer.png",
        alt: "3D World Explorer floating island game artwork",
      },
    ],
  },
  {
    number: "02",
    title: "Shape the hero",
    copy: "Character-led motion reference for silhouettes, abilities, and animated presentation.",
    video: "/creator-media/world-motion-02.mp4",
    href: "https://grok.com/imagine/post/b238362d-e8fb-40f0-ac5f-20ba75ec5734",
    concepts: [
      {
        title: "Legends of the Shattered Dimension",
        image: "/creator-media/showcase-shattered-dimension.jpg",
        alt: "Legends of the Shattered Dimension fantasy RPG cover artwork",
      },
      {
        title: "Nightmare's Embrace",
        image: "/creator-media/showcase-nightmares-embrace.jpg",
        alt: "Nightmare's Embrace survival horror cover artwork",
      },
      {
        title: "Skyfall Heroes",
        image: "/creator-media/character-generator.jpg",
        alt: "Skyfall Heroes warrior cover artwork",
      },
      {
        title: "AI NPC Story Game",
        image: "/game-cards/ai-npc-story-game.png",
        alt: "AI NPC story game character artwork",
      },
    ],
  },
  {
    number: "03",
    title: "Build the atmosphere",
    copy: "A moving world study for lighting, scale, pacing, and the final playable mood.",
    video: "/creator-media/world-motion-03.mp4",
    href: "https://grok.com/imagine/post/4d7b40ab-2283-4c6b-8711-c2d6223a6856",
    concepts: [
      {
        title: "Legends of Aeterna",
        image: "/creator-media/showcase-legends-aeterna.jpg",
        alt: "Legends of Aeterna fantasy action cover artwork",
      },
      {
        title: "Geometrix",
        image: "/creator-media/showcase-geometrix.jpg",
        alt: "Geometrix colorful 3D puzzle adventure cover artwork",
      },
      {
        title: "Love's Horizon",
        image: "/creator-media/game-generator.jpg",
        alt: "Love's Horizon story game cover artwork",
      },
      {
        title: "Moonlit Casefile",
        image: "/game-cards/moonlit-casefile.png",
        alt: "Moonlit Casefile noir character investigation artwork",
      },
    ],
  },
] as const;

const motionGridItems = [
  { kind: "motion", story: motionStories[0] },
  { kind: "concept", number: "01.2", concept: motionStories[0].concepts[1] },
  { kind: "concept", number: "01.1", concept: motionStories[0].concepts[0] },
  { kind: "motion", story: motionStories[2] },
  { kind: "concept", number: "02.1", concept: motionStories[1].concepts[0] },
  { kind: "concept", number: "03.1", concept: motionStories[2].concepts[0] },
  { kind: "motion", story: motionStories[1] },
  { kind: "concept", number: "02.2", concept: motionStories[1].concepts[1] },
  { kind: "concept", number: "03.2", concept: motionStories[2].concepts[1] },
  { kind: "concept", number: "01.3", concept: motionStories[0].concepts[2] },
  { kind: "concept", number: "02.3", concept: motionStories[1].concepts[2] },
  { kind: "concept", number: "03.3", concept: motionStories[2].concepts[2] },
  { kind: "concept", number: "01.4", concept: motionStories[0].concepts[3] },
  { kind: "concept", number: "02.4", concept: motionStories[1].concepts[3] },
  { kind: "concept", number: "03.4", concept: motionStories[2].concepts[3] },
] as const;

const editorConceptNumbers = new Set(["02.1", "03.2", "02.3"]);
const editorAssetLabels = ["TREE", "ROCK", "PROP", "FIRE", "CRATE"];

const motionRainDrops = Array.from({ length: 84 }, (_, index) => ({
  id: `motion-rain-${index}`,
  style: {
    left: `${(index * 37) % 101}%`,
    top: `${(index * 47) % 101}%`,
    height: `${10 + ((index * 11) % 28)}px`,
    opacity: 0.18 + ((index * 13) % 42) / 100,
    animationDelay: `-${((index * 17) % 76) / 10}s`,
    animationDuration: `${3.2 + ((index * 7) % 24) / 10}s`,
  },
}));

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
          <div className="bb-hero-media" aria-hidden="true">
            <div className="bb-hero-media-column bb-hero-media-video">
              <video src="/creator-media/world-motion-01.mp4" autoPlay muted loop playsInline preload="metadata" />
            </div>
            {heroImageColumns.map((images, columnIndex) => (
              <div className="bb-hero-media-column bb-hero-media-stack" key={`hero-column-${columnIndex + 1}`}>
                {images.map((image) => (
                  <div className="bb-hero-media-cell" key={image}>
                    <Image src={image} alt="" fill loading="eager" sizes="(max-width: 800px) 34vw, 33vw" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="bb-orb bb-orb-one" />
          <div className="bb-orb bb-orb-two" />
          <div className="bb-shell bb-hero-inner">
            <p className="bb-kicker bb-hero-kicker"><span /> AI 3D SCENE GENERATOR</p>
            <h1>Create the asset.<br /><em>Build the world.</em></h1>
            <p className="bb-hero-copy">
              Describe a compact 3D scene, generate a textured GLB asset, and explore it in an interactive browser viewport.
            </p>
            <div className="bb-hero-actions">
              <Link href="/ai-3d-scene-generator" className="bb-button bb-button-primary">Generate a 3D scene <ArrowRight size={17} /></Link>
              <a href="#features" className="bb-button bb-button-ghost">View all features</a>
            </div>
            <HeroPrompt />
          </div>
        </section>

        <section className="bb-section bb-skills" id="features">
          <div className="bb-shell">
            <div className="bb-feature-heading">
              <SectionHeading eyebrow="FOUR CREATOR TOOLS" title="Four engines. One creative universe." copy="The scene workflow is live. Character, template, and complete game generation continue on the roadmap." />
              <div className="bb-feature-heading-count"><strong>04</strong><span>AI CREATOR<br />SYSTEMS</span></div>
            </div>
            <div className="bb-feature-showcase">
              {features.map(({ icon: Icon, number, title, copy, status, active, image, imageAlt, ...feature }) => {
                const card = <article className={active ? "bb-feature-card bb-feature-active" : "bb-feature-card bb-feature-coming"}>
                  <div className="bb-feature-card-media"><Image src={image} alt={imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
                  <div className="bb-feature-card-shade" />
                  <span className="bb-feature-number">{number}</span>
                  <div className="bb-feature-card-status">{active ? <i /> : <Lock size={12} />}{status}</div>
                  <div className="bb-feature-card-body">
                    <Icon size={25} />
                    <span>CREATOR ENGINE / {number}</span>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <div className="bb-feature-card-rail"><span>AI-POWERED</span><span>{active ? "ACTIVE PREVIEW" : "ROADMAP"}</span></div>
                </article>;
                const href = "href" in feature && typeof feature.href === "string" ? feature.href : undefined;
                return href ? <Link className="bb-feature-link" href={href} key={title}>{card}</Link> : <article className="bb-feature-card-frame" key={title}>{card}</article>;
              })}
            </div>
          </div>
        </section>

        <section className="bb-section bb-creator-showcase">
          <div className="bb-motion-rain" aria-hidden="true">
            {motionRainDrops.map((drop) => <span key={drop.id} style={drop.style} />)}
          </div>
          <div className="bb-shell">
            <SectionHeading eyebrow="WORLDS IN MOTION" title="See the idea become a living world." copy="Three cinematic studies move through twelve game-cover concepts and distinct visual directions." />
            <div className="bb-motion-board">
              <div className="bb-motion-board-bar">
                <span><Cuboid size={13} /> BerryBox / visual library</span>
                <span><i /> LIVE CREATOR BOARD</span>
              </div>
              <div className="bb-motion-grid">
                {motionGridItems.map((item) => {
                  if (item.kind === "motion") {
                    const { story } = item;

                    return (
                      <article className="bb-motion-card bb-motion-video" key={`motion-${story.number}`}>
                        <div className="bb-motion-card-bar">
                          <span><Film size={11} /> {story.number} / MOTION STUDY</span>
                          <span>LIVE</span>
                        </div>
                        <div className="bb-motion-media">
                          <video src={story.video} autoPlay muted loop playsInline controls preload="metadata" aria-label={`${story.title} motion reference`} />
                          <div className="bb-motion-shade" />
                        </div>
                        <div className="bb-motion-copy">
                          <div>
                            <span>PLAYABLE WORLD STUDY</span>
                            <h3>{story.title}</h3>
                            <p>{story.copy}</p>
                          </div>
                          <a href={story.href} target="_blank" rel="noreferrer" aria-label={`View the original ${story.title} motion study`}>Open <ExternalLink size={12} /></a>
                        </div>
                      </article>
                    );
                  }

                  const { concept } = item;
                  const isEditorConcept = editorConceptNumbers.has(item.number);

                  return (
                    <article className={isEditorConcept ? "bb-motion-card bb-motion-concept bb-motion-editor-card" : "bb-motion-card bb-motion-concept"} key={item.number}>
                      <div className="bb-motion-card-bar">
                        <span><Cuboid size={11} /> {item.number} / COVER CONCEPT</span>
                        <span>READY</span>
                      </div>
                      <div className="bb-motion-media">
                        <Image className="bb-motion-concept-art" src={concept.image} alt={concept.alt} fill sizes="(max-width: 580px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                        <div className="bb-motion-shade" />
                        {isEditorConcept ? (
                          <div className="bb-concept-editor" aria-hidden="true">
                            <div className="bb-concept-editor-top">
                              <strong><Cuboid size={9} /> BerryBox Studio</strong>
                              <span className="active">World</span><span>Gameplay</span><span>NPCs</span><span>Assets</span>
                              <b>Publish</b>
                            </div>
                            <div className="bb-concept-editor-left">
                              <span className="bb-editor-avatar">AI</span>
                              <strong>Scene Director</strong>
                              <p>What should we add to this world?</p>
                              <small>+ ADD OBJECT</small>
                            </div>
                            <div className="bb-concept-editor-right">
                              <strong>Systems</strong>
                              <small>GAME SYSTEMS</small>
                              <span><i /> Health</span><span><i /> Inventory</span><span><i /> Quest</span><span><i /> Combat</span>
                            </div>
                            <div className="bb-concept-editor-assets">
                              <strong>ASSETS</strong>
                              {editorAssetLabels.map((label) => <span key={label}><i />{label}</span>)}
                            </div>
                            <span className="bb-editor-crosshair">+</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="bb-motion-copy">
                        <div>
                          <span>ART DIRECTION / GAME COVER</span>
                          <h3>{concept.title}</h3>
                        </div>
                        <span className="bb-motion-ready"><i /> CONCEPT</span>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="bb-motion-board-footer">
                <span>15 VISUAL DIRECTIONS</span>
                <span>AI-POWERED / CREATOR-FOCUSED / GAME-READY</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-section bb-foundation">
          <div className="bb-shell">
            <SectionHeading eyebrow="PRODUCTION FOUNDATION" title="Every scene survives the browser." copy="Meshy keys stay server-side while PostgreSQL jobs and private Blob files keep generation durable and owned." />
            <div className="bb-foundation-grid">
              <article><span>LIVE</span><Cuboid size={27} /><h3>Meshy scene pipeline</h3><p>Preview geometry, add 2K PBR textures, and save a private textured GLB.</p></article>
              <article><span>DURABLE</span><UserRound size={27} /><h3>Owned scene history</h3><p>Browser-bound ownership, idempotent jobs, real progress, retry-safe storage, and deletion.</p></article>
              <article><span>PRIVATE</span><Code2 size={27} /><h3>Application storage</h3><p>Generated GLBs and thumbnails move promptly from temporary provider URLs into private Blob storage.</p></article>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
