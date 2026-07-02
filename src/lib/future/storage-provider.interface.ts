import type { GeneratedGameFile, GameAsset } from "./ai-provider.interface";

export type StoredProject = {
  id: string;
  ownerId: string;
  name: string;
  files: GeneratedGameFile[];
  assets: GameAsset[];
  updatedAt: string;
};

export interface StorageProvider {
  saveProject(project: StoredProject): Promise<StoredProject>;
  loadProject(projectId: string): Promise<StoredProject | null>;
  uploadAsset(projectId: string, asset: File): Promise<GameAsset>;
}
