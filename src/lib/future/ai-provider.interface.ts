export type GamePlan = {
  title: string;
  genre: string;
  summary: string;
  mechanics: string[];
  assets: string[];
};

export type GeneratedGameFile = {
  path: string;
  content: string;
  language?: string;
};

export type GameAsset = {
  id: string;
  name: string;
  url: string;
  kind: "sprite" | "background" | "audio" | "ui" | "other";
};

export interface AiProvider {
  generateGamePlan(prompt: string): Promise<GamePlan>;
  generateGameFiles(plan: GamePlan): Promise<GeneratedGameFile[]>;
  modifyGame(projectId: string, message: string): Promise<GeneratedGameFile[]>;
  generateAsset(prompt: string): Promise<GameAsset>;
}
