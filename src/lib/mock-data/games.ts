export type GalleryGame = {
  title: string;
  description: string;
  category: string;
  likes: number;
  plays: number;
  accent: "teal" | "coral" | "violet" | "amber";
  image: string;
};

export const featuredGames: GalleryGame[] = [
  {
    title: "Skyforge Isles",
    description: "A 3D environment template with portals, terrain, and floating ruins.",
    category: "3D Template",
    likes: 0,
    plays: 0,
    accent: "violet",
    image: "/game-cards/skyforge-isles.svg",
  },
  {
    title: "Ancient Forest Portal",
    description: "A modular 3D portal concept prepared for prompt-based generation.",
    category: "3D Asset",
    likes: 0,
    plays: 0,
    accent: "teal",
    image: "/game-cards/3d-world-explorer.png",
  },
  {
    title: "Game-ready Character",
    description: "A future 3D character, rigging, and animation pipeline concept.",
    category: "3D Character",
    likes: 0,
    plays: 0,
    accent: "coral",
    image: "/game-cards/ai-npc-story-game.png",
  },
];

export const galleryGames = featuredGames;
