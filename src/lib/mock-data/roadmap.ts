export type RoadmapPhase = {
  phase: string;
  title: string;
  items: string[];
  accent: "teal" | "coral" | "violet" | "amber";
};

export const roadmap: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Static MVP",
    items: [
      "Static frontend",
      "Template gallery",
      "Mock editor",
      "Mock game preview",
    ],
    accent: "teal",
  },
  {
    phase: "Phase 2",
    title: "Project Accounts",
    items: ["Auth", "Database", "Real AI prompt-to-game", "Save projects"],
    accent: "coral",
  },
  {
    phase: "Phase 3",
    title: "Generation Pipeline",
    items: ["AI asset generation", "AI NPCs", "Game publishing", "Payments"],
    accent: "violet",
  },
  {
    phase: "Phase 4",
    title: "Community Worlds",
    items: ["3D worlds", "Multiplayer", "Marketplace/community"],
    accent: "amber",
  },
];
