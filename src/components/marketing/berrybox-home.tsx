import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Cuboid,
  ExternalLink,
  Film,
  Gamepad2,
  Lock,
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
    image: "/creator-media/template-generator.jpg",
    imageAlt: "Aether's Fall action RPG cover artwork",
  },
  {
    icon: UserRound,
    number: "02",
    title: "Create a 3D character using a prompt",
    copy: "Generate an original textured humanoid, auto-rig it, preview its animation, and download the GLB or FBX.",
    status: "AVAILABLE NOW",
    href: "/characters",
    active: true,
    image: "/creator-media/character-generator.jpg",
    imageAlt: "Skyfall Heroes warrior cover artwork",
  },
  {
    icon: Gamepad2,
    number: "03",
    title: "Create a 3D game using a prompt",
    copy: "A future workflow for generating structured game systems, scenes, and playable interactions.",
    status: "COMING SOON",
    href: "/workflow",
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
        </section>

        <section className="bb-section bb-skills" id="features">
          <div className="bb-shell">
            <SectionHeading eyebrow="THREE CREATOR TOOLS" title="Two are live. One is next." copy="Generate standalone 3D assets or build an original rigged character today. Complete prompt-to-game generation is the next workflow." />
            <div className="bb-skill-grid bb-three-features">
              {features.map(({ icon: Icon, number, title, copy, status, href, active, image, imageAlt }) => (
                <Link className={active ? "bb-skill-card bb-feature-live" : "bb-skill-card bb-feature-locked"} href={href} key={title}>
                  <div className="bb-skill-card-media"><Image src={image} alt={imageAlt} fill sizes="(max-width: 580px) 100vw, (max-width: 800px) 50vw, 33vw" /></div>
                  <div className="bb-skill-top"><Icon size={23} /><span>{number}</span></div>
                  <div className="bb-feature-status">{active ? <span /> : <Lock size={11} />}{status}</div>
                  <h3>{title}</h3><p>{copy}</p><ChevronRight className="bb-card-arrow" size={18} />
                </Link>
              ))}
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

                  return (
                    <article className="bb-motion-card bb-motion-concept" key={item.number}>
                      <div className="bb-motion-card-bar">
                        <span><Cuboid size={11} /> {item.number} / COVER CONCEPT</span>
                        <span>READY</span>
                      </div>
                      <div className="bb-motion-media">
                        <Image className="bb-motion-concept-art" src={concept.image} alt={concept.alt} fill sizes="(max-width: 580px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                        <div className="bb-motion-shade" />
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
            <SectionHeading eyebrow="PROVIDER FOUNDATION" title="The right API for each 3D job." copy="Keys stay server-side and can be added in Vercel. The interface exposes only readiness—not credentials." />
            <div className="bb-foundation-grid">
              <article><span>LIVE</span><Cuboid size={27} /><h3>fal.ai gateway</h3><p>One server-side key for queued 3D generation and normalized GLB output.</p></article>
              <article><span>LIVE</span><UserRound size={27} /><h3>Character pipeline</h3><p>Generate textured humanoids with pose control, automatic rigging, animation, and engine-friendly exports.</p></article>
              <article><span>CONFIGURABLE</span><Code2 size={27} /><h3>3D model catalog</h3><p>Add approved fal endpoints through Vercel while keeping every provider credential on the server.</p></article>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
