import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, Layers3, Sparkles } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";

export function ComingSoon({ kind }: { kind: "character" | "workflow" }) {
  const character = kind === "character";
  const items = character
    ? ["Describe an original stylized character", "Preview and refine the character in 3D", "Prepare compatible characters for BerryBox worlds"]
    : ["Bring future characters into your worlds", "Keep assets and game projects connected", "Publish, share, and remix with creator permission"];

  return (
    <PageShell>
      <section className="bb-coming">
        <div className="bb-shell">
          <Link href="/" className="bb-coming-back"><ArrowLeft size={15} /> Back to BerryBox</Link>
          <div className="bb-coming-grid">
            <div className="bb-coming-copy">
              <span className="bb-coming-status"><Clock3 size={13} /> COMING SOON · {character ? "BETA" : "ROADMAP"}</span>
              <p className="bb-kicker">{character ? "THE NEXT CREATIVE TOOL" : "THE CONNECTED STUDIO"}</p>
              <h1>{character ? <>Create the hero.<br /><em>Then build the world.</em></> : <>One idea.<br /><em>One connected flow.</em></>}</h1>
              <p className="bb-coming-lead">{character ? "A dedicated character workspace is planned for describing, shaping, and preparing original 3D characters for future BerryBox worlds." : "The long-term BerryBox workflow brings worlds, characters, projects, publishing, and sharing into one focused creator system."}</p>
              <ul>{items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
              <div className="bb-coming-note"><Sparkles size={16} /><p><b>Not available in this release.</b><span>Templates and the AI-assisted builder are ready to explore today.</span></p></div>
              <Link href="/templates" className="bb-button bb-button-primary">Try the current alpha <ArrowRight size={16} /></Link>
            </div>

            <div className="bb-coming-visual">
              <Image src={character ? "/game-cards/visual-novel.png" : "/game-cards/3d-world-explorer.png"} alt={character ? "Character creator concept" : "Connected game workflow concept"} fill priority sizes="(max-width: 900px) 100vw, 52vw" />
              <div className="bb-coming-shade" />
              <div className="bb-coming-panel">
                <div><Layers3 size={16} /><span>{character ? "CHARACTER PIPELINE" : "CONNECTED PROJECT"}</span></div>
                {items.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}<span>{index === 0 ? "PLANNED" : "QUEUED"}</span></p>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
