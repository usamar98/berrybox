import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Cuboid,
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
