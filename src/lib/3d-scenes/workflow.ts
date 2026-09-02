import { sceneConfig } from "./config";
import { createGeometryTask, createTextureTask, getMeshyTask, MeshyError, type MeshyTask } from "./meshy";
import { saveSceneAssets } from "./storage";
import { claimNextSceneJob, updateClaimedSceneJob } from "./store";
import type { SceneJob } from "./types";

export type WorkflowDependencies = {
  createGeometry: typeof createGeometryTask;
  createTexture: typeof createTextureTask;
  getTask: typeof getMeshyTask;
  saveAssets: typeof saveSceneAssets;
};

const productionDependencies: WorkflowDependencies = {
  createGeometry: createGeometryTask,
  createTexture: createTextureTask,
  getTask: getMeshyTask,
  saveAssets: saveSceneAssets,
};

function providerFailure(task: MeshyTask) {
  return task.task_error?.message?.slice(0, 300) || `Meshy task ${task.status.toLowerCase()}.`;
}

export async function advanceSceneJob(job: SceneJob, dependencies: WorkflowDependencies = productionDependencies) {
  if (!job.geometryTaskId) {
    const geometryTaskId = await dependencies.createGeometry(job.submittedPrompt, job.model);
    return { status: "processing" as const, stage: "creating_geometry" as const, progress: 5, geometryTaskId, errorCode: undefined, errorMessage: undefined };
  }

  if (!job.textureTaskId) {
    const geometry = await dependencies.getTask(job.geometryTaskId);
    if (geometry.status === "FAILED" || geometry.status === "CANCELED") {
      return { status: "failed" as const, stage: "failed" as const, progress: Math.min(45, Math.round(geometry.progress * .45)), errorCode: "geometry_failed", errorMessage: providerFailure(geometry), quotaUnitsSettled: 0, completedAt: new Date().toISOString() };
    }
    if (geometry.status !== "SUCCEEDED") {
      return { status: "processing" as const, stage: "creating_geometry" as const, progress: Math.max(5, Math.min(45, Math.round(geometry.progress * .45))) };
    }
    const textureTaskId = await dependencies.createTexture(job.geometryTaskId, job.model);
    return { status: "processing" as const, stage: "adding_textures" as const, progress: 50, textureTaskId };
  }

  const texture = await dependencies.getTask(job.textureTaskId);
  if (texture.status === "FAILED" || texture.status === "CANCELED") {
    return { status: "failed" as const, stage: "failed" as const, progress: Math.max(50, Math.min(80, Math.round(50 + texture.progress * .3))), errorCode: "texture_failed", errorMessage: providerFailure(texture), quotaUnitsSettled: 1, completedAt: new Date().toISOString() };
  }
  if (texture.status !== "SUCCEEDED") {
    return { status: "processing" as const, stage: "adding_textures" as const, progress: Math.max(50, Math.min(80, Math.round(50 + texture.progress * .3))) };
  }
  if (!texture.model_urls?.glb) {
    return { status: "failed" as const, stage: "failed" as const, progress: 80, errorCode: "missing_glb", errorMessage: "Meshy completed without the required GLB output.", quotaUnitsSettled: 2, completedAt: new Date().toISOString() };
  }

  const assets = await dependencies.saveAssets({
    ownerId: job.ownerId,
    jobId: job.id,
    modelUrl: texture.model_urls.glb,
    thumbnailUrl: texture.thumbnail_url,
  });
  return {
    status: "ready" as const,
    stage: "ready" as const,
    progress: 100,
    modelBlobPath: assets.modelPath,
    modelSizeBytes: assets.modelSizeBytes,
    thumbnailBlobPath: assets.thumbnailPath,
    thumbnailMime: assets.thumbnailMime,
    quotaUnitsSettled: 2,
    errorCode: undefined,
    errorMessage: undefined,
    completedAt: new Date().toISOString(),
  };
}

export async function processNextSceneJob() {
  const job = await claimNextSceneJob();
  if (!job || !job.leaseToken) return { processed: false };
  try {
    const stale = Date.now() - new Date(job.createdAt).getTime() > 3 * 60 * 60 * 1000;
    const patch = stale
      ? { status: "failed" as const, stage: "failed" as const, progress: job.progress, errorCode: "stalled", errorMessage: "Generation did not finish within the safety window.", quotaUnitsSettled: job.textureTaskId ? 2 : job.geometryTaskId ? 1 : 0, completedAt: new Date().toISOString() }
      : await advanceSceneJob(job);
    const updated = await updateClaimedSceneJob(job.id, job.leaseToken, patch);
    return { processed: true, id: updated.id, status: updated.status, stage: updated.stage };
  } catch (error) {
    const ambiguous = error instanceof MeshyError && error.ambiguous;
    const retryStorage = job.textureTaskId && !(error instanceof MeshyError);
    const patch = ambiguous
      ? { status: "review_required" as const, stage: "failed" as const, errorCode: "ambiguous_submission", errorMessage: error.message, completedAt: new Date().toISOString() }
      : retryStorage
        ? { status: "processing" as const, stage: "saving_model" as const, progress: 90, errorCode: "storage_retry", errorMessage: "Saving the completed model will be retried without regenerating it." }
        : { status: "failed" as const, stage: "failed" as const, errorCode: "worker_failed", errorMessage: error instanceof Error ? error.message.slice(0, 300) : "The scene worker failed.", completedAt: new Date().toISOString() };
    await updateClaimedSceneJob(job.id, job.leaseToken, patch);
    return { processed: true, id: job.id, status: patch.status, stage: patch.stage };
  }
}

export async function processSceneBatch() {
  const results = [];
  for (let index = 0; index < sceneConfig().workerBatchSize; index += 1) {
    const result = await processNextSceneJob();
    results.push(result);
    if (!result.processed) break;
  }
  return results;
}
