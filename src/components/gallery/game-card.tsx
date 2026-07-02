"use client";

import { Copy, Heart, Play, RotateCcw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { ToastButton } from "@/components/shared/toast-button";
import { GameImage } from "@/components/shared/game-image";
import type { GalleryGame } from "@/lib/mock-data/games";

export function GameCard({ game }: { game: GalleryGame }) {
  return (
    <Panel className="flex h-full flex-col overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:border-orange-200/30">
      <GameImage src={game.image} alt={`${game.title} game image`} className="min-h-40" />
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">{game.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {game.description}
            </p>
          </div>
          <Badge tone="violet">{game.category}</Badge>
        </div>
        <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-[var(--coral)]" />
            {game.likes.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--teal)]" />
            {game.plays.toLocaleString()}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <ToastButton size="sm" message={`${game.title} play demo coming soon`}>
            <Play className="h-4 w-4" />
            Play
          </ToastButton>
          <ToastButton
            size="sm"
            variant="secondary"
            message={`${game.title} clone flow coming soon`}
          >
            <Copy className="h-4 w-4" />
            Clone
          </ToastButton>
          <ToastButton
            size="sm"
            variant="secondary"
            message={`${game.title} remix flow coming soon`}
          >
            <RotateCcw className="h-4 w-4" />
            Remix
          </ToastButton>
        </div>
      </div>
    </Panel>
  );
}
