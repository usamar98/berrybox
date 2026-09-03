import { databaseUrl, missingSceneConfiguration, sceneConfig } from "@/lib/3d-scenes/config";

function characterQuota() {
  const parsed = Number.parseInt(process.env.MESHY_DAILY_CHARACTER_QUOTA || "", 10);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 10;
}

export function characterConfig() {
  return { ...sceneConfig(), dailyQuota: characterQuota() };
}

export function missingCharacterConfiguration() {
  return missingSceneConfiguration();
}

export function characterGenerationAvailable() {
  return missingCharacterConfiguration().length === 0;
}

export { databaseUrl };
