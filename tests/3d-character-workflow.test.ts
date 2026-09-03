import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { buildCharacterPrompt, CHARACTER_PROMPT_MAX } from "../src/lib/3d-characters/prompt";
import { toPublicCharacter, type CharacterJob } from "../src/lib/3d-characters/types";
import { advanceCharacterJob, type CharacterWorkflowDependencies } from "../src/lib/3d-characters/workflow";

const fixture: CharacterJob = {
  id: "8a841659-84b4-4eaa-b017-c514a9e18fb2",
  ownerId: "f951edaf-c196-4be6-93ec-0cb46793d56f",
  originalPrompt: "A silver-haired sky ranger with layered leather armor and a short cape.",
  submittedPrompt: "A complete full-body sky ranger in an A-pose.",
  model: "meshy-7",
  settings: {
    style: "stylized",
    bodyPlan: "humanoid",
    pose: "a-pose",
    modelType: "standard",
    topology: "triangle",
    targetPolycount: 30_000,
    textureResolution: "2k",
    enablePbr: true,
    targetFormats: ["glb"],
  },
  status: "queued",
  stage: "queued",
  progress: 0,
  submissionKey: "7ec2d07e-6d4b-477b-b38d-3d32f9c50025",
  quotaUnitsReserved: 2,
  quotaUnitsSettled: 0,
  attempts: 0,
  leaseToken: "40e2f4a8-b00e-43cf-a119-9822573899d4",
  createdAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T00:00:00.000Z",
};

test("character prompts preserve the brief and add bounded production direction", () => {
  const prompt = buildCharacterPrompt({
    prompt: "  A clockwork knight with brass armor.  ",
    style: "low-poly",
    bodyPlan: "robot",
    pose: "t-pose",
  });
  assert.match(prompt, /^A clockwork knight with brass armor\./);
  assert.match(prompt, /one complete original robot character/);
  assert.match(prompt, /clean T-pose/);
  assert.match(prompt, /No environment/);
  assert.ok(buildCharacterPrompt({ prompt: "x".repeat(CHARACTER_PROMPT_MAX), style: "realistic", bodyPlan: "creature", pose: "neutral" }).length <= 800);
});

test("character workflow creates geometry, textures it, and prefers the alpha thumbnail", async () => {
  const calls: string[] = [];
  let savedThumbnail = "";
  const dependencies: CharacterWorkflowDependencies = {
    createGeometry: async (prompt, model, options) => {
      calls.push(`geometry:${prompt}:${model}:${options?.alphaThumbnail}:${options?.autoSize}`);
      return "character-geometry";
    },
    createTexture: async (taskId, model, options) => {
      calls.push(`texture:${taskId}:${model}:${options?.alphaThumbnail}:${options?.autoSize}`);
      return "character-texture";
    },
    getTask: async (taskId) => taskId === "character-geometry"
      ? { id: taskId, status: "SUCCEEDED", progress: 100 }
      : { id: taskId, status: "SUCCEEDED", progress: 100, model_urls: { glb: "https://assets.meshy.ai/character.glb" }, thumbnail_url: "https://assets.meshy.ai/regular.png", alpha_thumbnail_url: "https://assets.meshy.ai/alpha.png" },
    saveAssets: async (input) => {
      savedThumbnail = input.thumbnailUrl || "";
      return { modelPath: "3d-characters/character.glb", modelSizeBytes: 4096, thumbnailPath: "3d-characters/thumbnail.png", thumbnailMime: "image/png" };
    },
  };

  const geometry = await advanceCharacterJob(fixture, dependencies);
  assert.equal(geometry.geometryTaskId, "character-geometry");
  const texturing = await advanceCharacterJob({ ...fixture, ...geometry }, dependencies);
  assert.equal(texturing.textureTaskId, "character-texture");
  const ready = await advanceCharacterJob({ ...fixture, ...geometry, ...texturing }, dependencies);
  assert.equal(ready.status, "ready");
  assert.equal(ready.quotaUnitsSettled, 2);
  assert.equal(savedThumbnail, "https://assets.meshy.ai/alpha.png");
  assert.match(calls[0], /true:true$/);
  assert.match(calls[1], /true:true$/);
});

test("character storage retries reuse the completed paid task", async () => {
  let paidSubmissions = 0;
  let storageAttempts = 0;
  const dependencies: CharacterWorkflowDependencies = {
    createGeometry: async () => { paidSubmissions += 1; return "unexpected"; },
    createTexture: async () => { paidSubmissions += 1; return "unexpected"; },
    getTask: async () => ({ id: "character-texture", status: "SUCCEEDED", progress: 100, model_urls: { glb: "https://assets.meshy.ai/character.glb" } }),
    saveAssets: async () => {
      storageAttempts += 1;
      if (storageAttempts === 1) throw new Error("temporary Blob failure");
      return { modelPath: "3d-characters/character.glb", modelSizeBytes: 2048, thumbnailPath: undefined, thumbnailMime: undefined };
    },
  };
  const completed = { ...fixture, status: "processing" as const, stage: "saving_model" as const, geometryTaskId: "character-geometry", textureTaskId: "character-texture" };
  await assert.rejects(() => advanceCharacterJob(completed, dependencies), /temporary Blob failure/);
  const ready = await advanceCharacterJob(completed, dependencies);
  assert.equal(ready.status, "ready");
  assert.equal(paidSubmissions, 0);
  assert.equal(storageAttempts, 2);
});

test("public character records expose only owned application routes and safe settings", () => {
  const ready = toPublicCharacter({ ...fixture, status: "ready", stage: "ready", modelBlobPath: "private/model.glb", thumbnailBlobPath: "private/thumb.png" });
  assert.equal(ready.modelUrl, `/api/3d-characters/${fixture.id}/model`);
  assert.equal(ready.downloadUrl, `/api/3d-characters/${fixture.id}/download`);
  assert.deepEqual(ready.settings, { style: "stylized", bodyPlan: "humanoid", pose: "a-pose" });
  assert.equal(JSON.stringify(ready).includes("private/model.glb"), false);
  assert.equal(JSON.stringify(ready).includes("submittedPrompt"), false);
});

test("character persistence, API ownership, navigation, and honest UI are wired", async () => {
  const migration = await readFile("db/migrations/002_create_3d_character_jobs.sql", "utf8");
  const store = await readFile("src/lib/3d-characters/store.ts", "utf8");
  const itemRoute = await readFile("src/app/api/3d-characters/[id]/route.ts", "utf8");
  const modelRoute = await readFile("src/app/api/3d-characters/[id]/model/route.ts", "utf8");
  const page = await readFile("src/components/characters/character-generator-page.tsx", "utf8");
  const header = await readFile("src/components/shared/site-header.tsx", "utf8");
  const home = await readFile("src/components/marketing/berrybox-home.tsx", "utf8");
  assert.match(migration, /UNIQUE \(owner_id, submission_key\)/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL ON TABLE berrybox_3d_character_jobs FROM anon, authenticated/);
  assert.match(store, /prepare: false/);
  assert.match(store, /owner_id = \$\{ownerId\}/);
  assert.match(itemRoute, /getCharacterJob\(id, owner\.ownerId\)/);
  assert.match(modelRoute, /getCharacterJob\(id, owner\.ownerId\)/);
  assert.match(modelRoute, /if \(asset\.size > 0\) headers\.set\("Content-Length"/);
  assert.match(page, /Static character asset\. Rigging and animation are not included/);
  assert.match(page, /kind="character"/);
  assert.match(header, /AI Character Generator/);
  assert.match(home, /href: "\/ai-3d-character-generator"/);
});
