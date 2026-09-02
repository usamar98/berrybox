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

const motionStories = [
  {
    number: "01",
    title: "Forge the encounter",
    copy: "Cinematic motion reference for combat, environments, and moment-to-moment game feel.",
    video: "/creator-media/world-motion-01.mp4",
    href: "https://grok.com/imagine/post/eabcf470-58fd-4def-a82e-3eb9cd7fea31",
  },
  {
    number: "02",
    title: "Shape the hero",
    copy: "Character-led motion reference for silhouettes, abilities, and animated presentation.",
    video: "/creator-media/world-motion-02.mp4",
    href: "https://grok.com/imagine/post/b238362d-e8fb-40f0-ac5f-20ba75ec5734",
  },
  {
    number: "03",
    title: "Build the atmosphere",
    copy: "A moving world study for lighting, scale, pacing, and the final playable mood.",
    video: "/creator-media/world-motion-03.mp4",
    href: "https://grok.com/imagine/post/4d7b40ab-2283-4c6b-8711-c2d6223a6856",
  },
];

const assetLayers = [
  { label: "Hero weapon", image: "/creator-media/layer-sword.png", alt: "Large futuristic sword", width: 768, height: 409, className: "bb-layer-wide" },
  { label: "Armor detail", image: "/creator-media/layer-shoulder-pads.png", alt: "Blue futuristic shoulder armor", width: 144, height: 144, className: "" },
  { label: "World crystal", image: "/creator-media/layer-crystals.png", alt: "Glowing blue crystal", width: 18, height: 96, className: "" },
  { label: "World flora", image: "/creator-media/layer-mushrooms.png", alt: "Glowing blue mushroom", width: 74, height: 74, className: "" },
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
          <div className="bb-shell">
            <SectionHeading eyebrow="WORLDS IN MOTION" title="See the idea become a living world." copy="Cinematic studies and production-ready asset layers give every generated world a clearer visual direction." />
            <div className="bb-motion-grid">
              {motionStories.map((story) => (
                <article className="bb-motion-card" key={story.video}>
                  <video src={story.video} autoPlay muted loop playsInline controls preload="metadata" aria-label={`${story.title} motion reference`} />
                  <div className="bb-motion-shade" />
                  <span className="bb-motion-number"><Film size={13} /> {story.number} / MOTION STUDY</span>
                  <div className="bb-motion-copy">
                    <h3>{story.title}</h3>
                    <p>{story.copy}</p>
                    <a href={story.href} target="_blank" rel="noreferrer">View original <ExternalLink size={13} /></a>
                  </div>
                </article>
              ))}
            </div>

            <div className="bb-layer-shelf">
              <div className="bb-layer-heading">
                <span>ASSET LAYERS</span>
                <h3>Details that sell the world.</h3>
                <p>Weapons, armor, crystals, and bioluminescent flora ready to guide the next generation.</p>
              </div>
              <div className="bb-layer-grid">
                {assetLayers.map((asset) => (
                  <figure className={`bb-layer-card ${asset.className}`} key={asset.label}>
                    <Image src={asset.image} alt={asset.alt} width={asset.width} height={asset.height} sizes={asset.className ? "40vw" : "18vw"} />
                    <figcaption>{asset.label}</figcaption>
                  </figure>
                ))}
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
