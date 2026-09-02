const SUPPORTED_MODELS = new Set(["meshy-5", "meshy-6", "meshy-7", "latest"]);

function integerSetting(name: string, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export function sceneConfig() {
  const requestedModel = process.env.MESHY_TEXT_TO_3D_MODEL || "meshy-7";
  return {
    model: SUPPORTED_MODELS.has(requestedModel) ? requestedModel : "meshy-7",
    dailyQuota: integerSetting("MESHY_DAILY_SCENE_QUOTA", 3, 1, 100),
    globalConcurrency: integerSetting("MESHY_GLOBAL_CONCURRENCY", 2, 1, 20),
    workerBatchSize: integerSetting("MESHY_WORKER_BATCH_SIZE", 2, 1, 10),
    maxModelBytes: integerSetting("MESHY_MAX_MODEL_BYTES", 100_000_000, 1_000_000, 250_000_000),
    maxThumbnailBytes: integerSetting("MESHY_MAX_THUMBNAIL_BYTES", 8_000_000, 100_000, 20_000_000),
  };
}

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function missingSceneConfiguration() {
  const missing: string[] = [];
  if (!process.env.MESHY_API_KEY) missing.push("MESHY_API_KEY");
  if (!databaseUrl()) missing.push("DATABASE_URL");
  if (!process.env.BLOB_READ_WRITE_TOKEN) missing.push("BLOB_READ_WRITE_TOKEN");
  if (process.env.NODE_ENV === "production" && !process.env.CRON_SECRET) missing.push("CRON_SECRET");
  return missing;
}

export function sceneGenerationAvailable() {
  return missingSceneConfiguration().length === 0;
}
