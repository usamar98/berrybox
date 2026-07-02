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
    title: "Neon Orchard",
    description: "A forest RPG where luminous fruit unlocks hidden dialogue.",
    category: "RPG",
    likes: 842,
    plays: 12840,
    accent: "teal",
    image: "/game-cards/neon-orchard.svg",
  },
  {
    title: "Byte Runner",
    description: "A side-scrolling sprint through broken arcade circuits.",
    category: "Platformer",
    likes: 641,
    plays: 9210,
    accent: "coral",
    image: "/game-cards/byte-runner.svg",
  },
  {
    title: "Moonlit Casefile",
    description: "A visual novel mystery with branching suspect interviews.",
    category: "Story",
    likes: 504,
    plays: 7750,
    accent: "violet",
    image: "/game-cards/moonlit-casefile.svg",
  },
];

export const galleryGames: GalleryGame[] = [
  ...featuredGames,
  {
    title: "Drift Signal",
    description: "A neon racing prototype with boost gates and ghost laps.",
    category: "Racing",
    likes: 437,
    plays: 6890,
    accent: "amber",
    image: "/game-cards/drift-signal.svg",
  },
  {
    title: "Cog Garden",
    description: "A cozy puzzle board about repairing tiny machines.",
    category: "Puzzle",
    likes: 389,
    plays: 5340,
    accent: "teal",
    image: "/game-cards/cog-garden.svg",
  },
  {
    title: "Skyforge Isles",
    description: "A 3D exploration shell with portals and floating ruins.",
    category: "3D",
    likes: 921,
    plays: 15420,
    accent: "violet",
    image: "/game-cards/skyforge-isles.svg",
  },
  {
    title: "NPC After Hours",
    description: "A dialogue playground for merchants with secret motives.",
    category: "AI NPC",
    likes: 318,
    plays: 4220,
    accent: "coral",
    image: "/game-cards/npc-after-hours.svg",
  },
  {
    title: "Astro Pantry",
    description: "A wave shooter where ingredients orbit your ship.",
    category: "Shooter",
    likes: 553,
    plays: 8010,
    accent: "amber",
    image: "/game-cards/astro-pantry.svg",
  },
  {
    title: "Rune Relay",
    description: "A cooperative-feeling logic game with timed glyph chains.",
    category: "Puzzle",
    likes: 267,
    plays: 3910,
    accent: "violet",
    image: "/game-cards/rune-relay.svg",
  },
  {
    title: "Forest Courier",
    description: "A top-down quest demo with coins, enemies, and NPC hints.",
    category: "RPG",
    likes: 709,
    plays: 11180,
    accent: "teal",
    image: "/game-cards/forest-courier.svg",
  },
  {
    title: "Circuit Cafe",
    description: "A story sim where robots trade rumors for recipes.",
    category: "Story",
    likes: 482,
    plays: 6120,
    accent: "coral",
    image: "/game-cards/circuit-cafe.svg",
  },
  {
    title: "Comet Cart",
    description: "A fast arcade racer across low-gravity rails.",
    category: "Arcade",
    likes: 366,
    plays: 4980,
    accent: "amber",
    image: "/game-cards/comet-cart.svg",
  },
];
