import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, Layers3, Sparkles } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";

export function ComingSoon() {
  const items = ["Describe a complete 3D game concept", "Generate validated systems and scene structure", "Preview and refine a playable browser build"];

  return (
    <PageShell>
      <section className="bb-coming">
        <div className="bb-shell">
          <Link href="/" className="bb-coming-back"><ArrowLeft size={15} /> Back to BerryBox</Link>
          <div className="bb-coming-grid">
            <div className="bb-coming-copy">
              <span className="bb-coming-status"><Clock3 size={13} /> COMING SOON</span>
              <p className="bb-kicker">3D GAME FROM A PROMPT</p>
              <h1>Describe the game.<br /><em>Then make it playable.</em></h1>
              <p className="bb-coming-lead">A future OpenAI-powered workflow will turn a prompt into a validated game specification, with fal models available for generated media and 3D assets.</p>
              <ul>{items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <div className="bb-coming-note"><Sparkles size={16} /><p><b>Not available in this release.</b><span>Templates and the AI-assisted builder are ready to explore today.</span></p></div>
              <Link href="/templates" className="bb-button bb-button-primary">Generate a 3D template now <ArrowRight size={16} /></Link>
            </div>

            <div className="bb-coming-visual">
              <Image src="/game-cards/3d-world-explorer.png" alt="3D game generator concept" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
              <div className="bb-coming-shade" />
              <div className="bb-coming-panel">
                <div><Layers3 size={16} /><span>GAME GENERATION PIPELINE</span></div>
                {items.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}<span>{index === 0 ? "PLANNED" : "QUEUED"}</span></p>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
