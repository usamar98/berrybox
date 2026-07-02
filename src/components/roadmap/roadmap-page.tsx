"use client";

import { CheckCircle2, Clock3, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { PageShell } from "@/components/shared/page-shell";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { roadmap } from "@/lib/mock-data/roadmap";

const toneMap = {
  teal: "text-[var(--teal)] border-teal-300/25 bg-teal-300/10",
  coral: "text-[var(--coral)] border-orange-300/25 bg-orange-300/10",
  violet: "text-[var(--violet)] border-violet-300/25 bg-violet-300/10",
  amber: "text-[var(--amber)] border-amber-300/25 bg-amber-300/10",
};

export function RoadmapPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              title="Roadmap"
              description="A phased path from this static frontend toward real accounts, AI generation, publishing, payments, 3D worlds, multiplayer, and community systems."
              align="center"
            />
          </Reveal>

          <div className="relative grid gap-4 lg:grid-cols-4">
            {roadmap.map((phase, index) => (
              <Reveal key={phase.phase} delay={index * 0.07}>
                <Panel className="relative h-full p-6">
                  <div
                    className={`mb-6 inline-grid h-12 w-12 place-items-center rounded-lg border ${toneMap[phase.accent]}`}
                  >
                    {index === 0 ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : index === 3 ? (
                      <Rocket className="h-5 w-5" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    )}
                  </div>
                  <Badge tone={index === 0 ? "teal" : "neutral"}>
                    {phase.phase}
                  </Badge>
                  <h3 className="mt-4 text-xl font-black text-white">
                    {phase.title}
                  </h3>
                  <ul className="mt-6 space-y-3 text-sm text-slate-300">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
