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
    title: "3D World Explorer",
    category: "3D",
    difficulty: "Advanced",
    description: "A navigable world shell with cameras, props, and portals.",
    accent: "violet",
    image: "/game-cards/3d-world-explorer.png",
  },
];

