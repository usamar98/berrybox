export const SCENE_STATUSES = ["queued", "processing", "ready", "failed", "canceled", "review_required"] as const;
export const SCENE_STAGES = ["queued", "creating_geometry", "adding_textures", "saving_model", "ready", "failed"] as const;

export type SceneStatus = (typeof SCENE_STATUSES)[number];
export type SceneStage = (typeof SCENE_STAGES)[number];
export type SceneSettings = Record<string, string | number | boolean | string[]>;

export type SceneJob = {
  id: string;
  ownerId: string;
  originalPrompt: string;
  submittedPrompt: string;
  model: string;
  settings: SceneSettings;
  status: SceneStatus;
  stage: SceneStage;
  progress: number;
  geometryTaskId?: string;
  textureTaskId?: string;
  modelBlobPath?: string;
  thumbnailBlobPath?: string;
  thumbnailMime?: string;
  modelSizeBytes?: number;
  errorCode?: string;
  errorMessage?: string;
  submissionKey: string;
  quotaUnitsReserved: number;
  quotaUnitsSettled: number;
  attempts: number;
  leaseToken?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type PublicScene = {
  id: string;
  prompt: string;
  status: SceneStatus;
  stage: SceneStage;
  stageLabel: string;
  progress: number;
  model: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
};

export function stageLabel(stage: SceneStage) {
  return {
    queued: "Queued",
    creating_geometry: "Creating geometry",
    adding_textures: "Adding textures",
    saving_model: "Saving model",
    ready: "Ready",
    failed: "Failed",
  }[stage];
}

export function toPublicScene(job: SceneJob): PublicScene {
  const ready = job.status === "ready";
  return {
    id: job.id,
    prompt: job.originalPrompt,
    status: job.status,
    stage: job.stage,
    stageLabel: stageLabel(job.stage),
    progress: job.progress,
    model: job.model,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    error: job.errorMessage,
    modelUrl: ready ? `/api/3d-scenes/${job.id}/model` : undefined,
    thumbnailUrl: job.thumbnailBlobPath ? `/api/3d-scenes/${job.id}/thumbnail` : undefined,
    downloadUrl: ready ? `/api/3d-scenes/${job.id}/download` : undefined,
  };
}
