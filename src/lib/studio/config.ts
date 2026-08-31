import { z } from "zod";

export const GameConfigSchema = z.object({
  title: z.string().trim().min(2).max(60),
  template: z.enum(["explorer", "runner"]),
  theme: z.enum(["forest", "neon", "desert"]),
  playerColor: z.enum(["mint", "rose", "violet", "gold"]),
  moveSpeed: z.number().min(3).max(10),
  health: z.number().int().min(1).max(5),
  collectibleCount: z.number().int().min(3).max(12),
  enemyCount: z.number().int().min(0).max(6),
  enemySpeed: z.number().min(0.5).max(3),
  behavior: z.enum(["patrol", "chase", "guard"]),
  timeLimit: z.number().int().min(30).max(180),
});

export type GameConfig = z.infer<typeof GameConfigSchema>;
export type TemplateId = GameConfig["template"];

export const templates: {
  id: TemplateId; title: string; category: string; description: string;
  features: string[]; config: GameConfig;
}[] = [
  {
    id: "explorer", title: "Crystal Grove", category: "Explore & collect",
    description: "A little world with a big adventure. Find every crystal, dodge the sentinels, and make it your own.",
    features: ["3D exploration", "Collectibles", "Enemy behaviors"],
    config: {
      title: "Crystal Grove", template: "explorer", theme: "forest",
      playerColor: "mint", moveSpeed: 5, health: 3, collectibleCount: 6,
      enemyCount: 2, enemySpeed: 1, behavior: "patrol", timeLimit: 120,
    },
  },
  {
    id: "runner", title: "Neon Rush", category: "Obstacle course",
    description: "Jump the barriers, pick up every crystal, and reach the portal before the clock runs out.",
    features: ["Jump & dodge", "Timed challenge", "Finish portal"],
    config: {
      title: "Neon Rush", template: "runner", theme: "neon",
      playerColor: "rose", moveSpeed: 6, health: 3, collectibleCount: 5,
      enemyCount: 1, enemySpeed: 1, behavior: "patrol", timeLimit: 90,
    },
  },
];

export function getTemplate(id?: string) {
  return templates.find((template) => template.id === id) ?? templates[0];
}

export function gameGoal(config: GameConfig) {
  return "Collect all " + config.collectibleCount + " crystals" +
    (config.template === "runner" ? " and reach the portal" : "") + " before time runs out.";
}

export const ProjectSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1).max(100),
  updatedAt: z.string(),
  config: GameConfigSchema,
});
export type Project = z.infer<typeof ProjectSchema>;
export const PROJECTS_KEY = "berrybox-studio-projects-v1";

export function parseProjects(raw: string | null): Project[] {
  if (!raw) return [];
  const result = z.array(ProjectSchema).max(50).safeParse(JSON.parse(raw));
  if (!result.success) throw new Error("Saved project data is invalid. Export your current project before clearing browser data.");
  return result.data;
}

export function upsertProject(projects: Project[], project: Project) {
  const exists = projects.some((item) => item.id === project.id);
  if (!exists && projects.length >= 50) throw new Error("This browser has 50 projects. Export a backup before removing projects from browser storage.");
  return [project, ...projects.filter((item) => item.id !== project.id)];
}
