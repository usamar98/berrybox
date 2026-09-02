"use client";

import Image from "next/image";
import { ExternalLink, Film, ImageIcon, Pause, Play, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

type MediaItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  eyebrow: string;
  meta: string;
  prompt: string;
  preview: string;
  poster?: string;
  sourceHref?: string;
};

const mediaItems: MediaItem[] = [
  {
    id: "ancient-forest",
    kind: "image",
    title: "Ancient Forest Portal",
    eyebrow: "3D WORLD REFERENCE",
    meta: "Environment · Moss · Ruins",
    prompt: "A modular ancient forest portal with mossy stone, low-poly edges, and game-ready proportions",
    preview: "/game-cards/3d-world-explorer.png",
  },
  {
    id: "skyforge",
    kind: "image",
    title: "Skyforge Islands",
    eyebrow: "3D LEVEL REFERENCE",
    meta: "Floating world · Stylized",
    prompt: "A modular floating island shrine with stylized cliffs, luminous crystals, and game-ready topology",
    preview: "/game-cards/skyforge-isles.svg",
  },
  {
    id: "forest-motion",
    kind: "video",
    title: "Forest Light Study",
    eyebrow: "FREE MOTION REFERENCE",
    meta: "Pexels · Forest canopy",
    prompt: "A sunlit forest canopy environment kit with layered foliage, mossy rocks, and soft volumetric light",
    preview: "https://videos.pexels.com/video-files/4208083/4208083-sd_960_506_24fps.mp4",
    poster: "/game-cards/forest-courier.svg",
    sourceHref: "https://www.pexels.com/video/looking-up-the-trees-in-th-forest-4208081/",
  },
  {
    id: "neon-kit",
    kind: "image",
    title: "Neon Material Kit",
    eyebrow: "MATERIAL REFERENCE",
    meta: "Sci-fi · Emissive · Props",
    prompt: "A compact cyberpunk prop kit with neon emissive panels, modular metal pieces, and clean UV-ready surfaces",
    preview: "/game-cards/neon-orchard.png",
  },
  {
    id: "fantasy-motion",
    kind: "video",
    title: "Fantasy Character Study",
    eyebrow: "FREE MOTION REFERENCE",
    meta: "Pexels · Character mood",
    prompt: "A stylized forest guardian character statue with layered natural armor, elegant silhouette, and game-ready detail",
    preview: "https://videos.pexels.com/video-files/32705776/13943174_360_640_30fps.mp4",
    poster: "/game-cards/ai-npc-story-game.png",
    sourceHref: "https://www.pexels.com/video/fantasy-cosplay-character-in-nature-setting-32705776/",
  },
  {
    id: "moonlit-props",
    kind: "image",
    title: "Moonlit Prop Set",
    eyebrow: "3D PROP REFERENCE",
    meta: "Noir · Modular · Cinematic",
    prompt: "A modular moonlit detective prop set with vintage lamps, evidence boxes, and stylized low-poly materials",
    preview: "/game-cards/moonlit-casefile.png",
  },
];

function VideoPreview({ item }: { item: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    void videoRef.current?.play().then(() => setPlaying(true)).catch(() => undefined);
  }

  function pause() {
    videoRef.current?.pause();
    setPlaying(false);
  }

  return (
    <div className="bb-media-video" onPointerEnter={play} onPointerLeave={pause}>
      <video ref={videoRef} src={item.preview} poster={item.poster} muted loop playsInline preload="none" aria-label={`${item.title} video preview`} />
      <button type="button" className="bb-media-play" onClick={playing ? pause : play} aria-label={`${playing ? "Pause" : "Play"} ${item.title} preview`}>
        {playing ? <Pause size={10} /> : <Play size={10} />} {playing ? "PLAYING" : "PLAY PREVIEW"}
      </button>
    </div>
  );
}

export function SourceMediaCarousel({ onUsePrompt }: { onUsePrompt: (prompt: string) => void }) {
  return (
    <section className="bb-media-deck" aria-label="Curated 3D image and video references">
      <div className="bb-media-deck-head">
        <div>
          <b>Curated source deck</b>
          <span>4 images · 2 motion clips · click any prompt to use it</span>
        </div>
        <span className="bb-media-count">06 CURATED REFERENCES</span>
      </div>

      <div className="bb-media-track">
        {mediaItems.map((item) => (
          <article className="bb-media-card" data-media-card key={item.id}>
            <div className="bb-media-preview">
              {item.kind === "video"
                ? <VideoPreview item={item} />
                : <Image src={item.preview} alt={`${item.title} reference`} fill loading={item.id === "ancient-forest" ? "eager" : "lazy"} sizes="(max-width: 580px) 100vw, (max-width: 900px) 50vw, 33vw" />}
              <span className="bb-media-kind">{item.kind === "video" ? <Film size={10} /> : <ImageIcon size={10} />}{item.kind}</span>
              <div className="bb-media-gradient" />
            </div>
            <div className="bb-media-card-copy">
              <small>{item.eyebrow}</small>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
              <div>
                <button type="button" onClick={() => onUsePrompt(item.prompt)}><Sparkles size={11} /> Use prompt</button>
                {item.sourceHref ? <a href={item.sourceHref} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} source`}><ExternalLink size={12} /></a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
