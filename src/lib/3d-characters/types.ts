import type { SceneStage, SceneStatus } from "@/lib/3d-scenes/types";

export const CHARACTER_STYLES = ["stylized", "realistic", "anime", "low-poly"] as const;
export const CHARACTER_BODY_PLANS = ["humanoid", "creature", "robot"] as const;
export const CHARACTER_POSES = ["a-pose", "t-pose", "neutral"] as const;

export type CharacterStyle = (typeof CHARACTER_STYLES)[number];
export type CharacterBodyPlan = (typeof CHARACTER_BODY_PLANS)[number];
export type CharacterPose = (typeof CHARACTER_POSES)[number];

export type CharacterSettings = {
  style: CharacterStyle;
  bodyPlan: CharacterBodyPlan;
  pose: CharacterPose;
  modelType: "standard";
  topology: "triangle";
  targetPolycount: number;
  textureResolution: "2k";
  enablePbr: true;
  targetFormats: ["glb"];
};

export type CharacterJob = {
  id: string;
  ownerId: string;
  originalPrompt: string;
  submittedPrompt: string;
  model: string;
  settings: CharacterSettings;
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

export type PublicCharacter = {
  id: string;
  prompt: string;
  status: SceneStatus;
  stage: SceneStage;
  stageLabel: string;
  progress: number;
  model: string;
  settings: Pick<CharacterSettings, "style" | "bodyPlan" | "pose">;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
};

export function characterStageLabel(stage: SceneStage) {
  return {
    queued: "Queued",
    creating_geometry: "Sculpting character",
    adding_textures: "Painting materials",
    saving_model: "Saving model",
    ready: "Ready",
    failed: "Failed",
  }[stage];
}

export function toPublicCharacter(job: CharacterJob): PublicCharacter {
  const ready = job.status === "ready";
  return {
    id: job.id,
    prompt: job.originalPrompt,
    status: job.status,
    stage: job.stage,
    stageLabel: characterStageLabel(job.stage),
    progress: job.progress,
    model: job.model,
    settings: {
      style: job.settings.style,
      bodyPlan: job.settings.bodyPlan,
      pose: job.settings.pose,
    },
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    error: job.errorMessage,
    modelUrl: ready ? `/api/3d-characters/${job.id}/model` : undefined,
    thumbnailUrl: job.thumbnailBlobPath ? `/api/3d-characters/${job.id}/thumbnail` : undefined,
    downloadUrl: ready ? `/api/3d-characters/${job.id}/download` : undefined,
  };
}
