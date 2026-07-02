"use client";

import { Gamepad2, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { GameCard } from "@/components/gallery/game-card";
import { PageShell } from "@/components/shared/page-shell";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { galleryGames } from "@/lib/mock-data/games";

const filters = ["All", "RPG", "Platformer", "Story", "3D", "Puzzle"];

export function GalleryPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <SectionHeading
                title="Generated games gallery"
                description="A static public gallery showing future play, clone, and remix workflows with mock engagement data."
                className="mb-0"
              />
              <Panel className="flex flex-wrap items-center gap-2 p-3">
                <span className="mr-1 inline-flex items-center gap-2 px-2 text-sm font-semibold text-slate-400">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </span>
                {filters.map((filter, index) => (
                  <Badge key={filter} tone={index === 0 ? "teal" : "neutral"}>
                    {filter}
                  </Badge>
                ))}
                <Badge tone="coral" className="ml-auto">
                  <Gamepad2 className="mr-1 h-3.5 w-3.5" />
                  {galleryGames.length} demos
                </Badge>
              </Panel>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {galleryGames.map((game, index) => (
              <Reveal key={game.title} delay={index * 0.035}>
                <GameCard game={game} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
