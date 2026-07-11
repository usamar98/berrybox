export type TemplateDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type GameTemplate = {
  title: string;
  category: string;
  difficulty: TemplateDifficulty;
  description: string;
  accent: "teal" | "coral" | "violet" | "amber";
  image: string;
};

export const templates: GameTemplate[] = [
  {
    title: "2D RPG Adventure",
    category: "Roleplaying",
    difficulty: "Beginner",
    description: "Dialogue, quests, collectibles, and a top-down forest map.",
    accent: "teal",
    image: "/game-cards/2d-rpg-adventure.png",
  },
  {
    title: "Platformer Game",
    category: "Action",
    difficulty: "Intermediate",
    description: "Jump arcs, hazards, pickups, checkpoints, and level flow.",
    accent: "coral",
    image: "/game-cards/platformer-game.png",
  },
  {
    title: "Visual Novel",
    category: "Story",
    difficulty: "Beginner",
    description: "Branching choices, character portraits, and scene scripting.",
    accent: "violet",
    image: "/game-cards/visual-novel.png",
  },
  {
    title: "Racing Game",
    category: "Arcade",
    difficulty: "Intermediate",
    description: "Track lanes, timers, boost pads, and rival drivers.",
    accent: "amber",
    image: "/game-cards/racing-game.png",
  },
  {
    title: "Puzzle Game",
    category: "Logic",
    difficulty: "Beginner",
    description: "Tile swaps, rules, goals, and satisfying win states.",
    accent: "teal",
    image: "/game-cards/puzzle-game.png",
  },
  {
    title: "3D World Explorer",
    category: "3D",
    difficulty: "Advanced",
    description: "A navigable world shell with cameras, props, and portals.",
    accent: "violet",
    image: "/game-cards/3d-world-explorer.png",
  },
  {
    title: "AI NPC Story Game",
    category: "AI Characters",
    difficulty: "Advanced",
    description: "NPC memory stubs, quest hooks, and branching dialogue.",
    accent: "coral",
    image: "/game-cards/ai-npc-story-game.png",
  },
  {
    title: "Arcade Shooter",
    category: "Shooter",
    difficulty: "Intermediate",
    description: "Enemy waves, scoring, powerups, and boss patterns.",
    accent: "amber",
    image: "/game-cards/arcade-shooter.png",
  },
];

