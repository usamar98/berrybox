import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createGeometryTask, createTextureTask, getMeshyTask, MeshyError } from "../src/lib/3d-scenes/meshy";
import { sceneOwner } from "../src/lib/3d-scenes/owner";
import type { SceneJob } from "../src/lib/3d-scenes/types";
import { advanceSceneJob, type WorkflowDependencies } from "../src/lib/3d-scenes/workflow";

const fixture: SceneJob = {
  id: "7d3fc9d4-77f4-40ab-a67c-0cc07208dc90",
  ownerId: "a3ace8a0-c228-49be-8b70-679388f79fea",
  originalPrompt: "A tiny forest campsite diorama with a tent and glowing campfire.",
  submittedPrompt: "A tiny forest campsite diorama with a tent and glowing campfire.",
  model: "meshy-7",
  settings: { targetPolycount: 30_000, textureResolution: "2k" },
  status: "queued",
  stage: "queued",
  progress: 0,
  submissionKey: "cf094837-40d7-4c4c-8097-5b1ea267a2a4",
  quotaUnitsReserved: 2,
  quotaUnitsSettled: 0,
  attempts: 0,
  leaseToken: "19917f0b-36a3-42f8-957e-7bec41377b91",
  createdAt: "2026-09-02T00:00:00.000Z",
  updatedAt: "2026-09-02T00:00:00.000Z",
};

test("Meshy adapter submits current preview and refine payloads with server authorization", async (context) => {
  const previous = process.env.MESHY_API_KEY;
  process.env.MESHY_API_KEY = "test-meshy-key";
  const requests: Array<{ url: string; init: RequestInit }> = [];
  const fetchMock = context.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), init: init || {} });
    return Response.json({ result: requests.length === 1 ? "preview-task" : "refine-task" });
  });
  try {
    assert.equal(await createGeometryTask(fixture.originalPrompt, "meshy-7"), "preview-task");
    assert.equal(await createTextureTask("preview-task", "meshy-7"), "refine-task");
    assert.equal(requests[0].url, "https://api.meshy.ai/openapi/v2/text-to-3d");
    assert.deepEqual(JSON.parse(String(requests[0].init.body)), {
      mode: "preview",
      prompt: fixture.originalPrompt,
      model_type: "standard",
      ai_model: "meshy-7",
      should_remesh: true,
      topology: "triangle",
      target_polycount: 30_000,
      target_formats: ["glb"],
      moderation: true,
    });
    assert.deepEqual(JSON.parse(String(requests[1].init.body)), {
      mode: "refine",
      preview_task_id: "preview-task",
      ai_model: "meshy-7",
      enable_pbr: true,
      texture_resolution: "2k",
      target_formats: ["glb"],
      moderation: true,
    });
    assert.equal(new Headers(requests[0].init.headers).get("authorization"), "Bearer test-meshy-key");
    assert.equal(String(requests[0].init.body).includes("test-meshy-key"), false);
  } finally {
    fetchMock.mock.restore();
    if (previous === undefined) delete process.env.MESHY_API_KEY;
    else process.env.MESHY_API_KEY = previous;
  }
});

test("ambiguous paid Meshy submissions are explicitly non-retryable", async (context) => {
  const previous = process.env.MESHY_API_KEY;
  process.env.MESHY_API_KEY = "test-meshy-key";
  const fetchMock = context.mock.method(globalThis, "fetch", async () => { throw new TypeError("network reset"); });
  try {
    await assert.rejects(() => createGeometryTask(fixture.originalPrompt, "meshy-7"), (error: unknown) => {
      assert.ok(error instanceof MeshyError);
      assert.equal(error.ambiguous, true);
      return true;
    });
  } finally {
    fetchMock.mock.restore();
    if (previous === undefined) delete process.env.MESHY_API_KEY;
    else process.env.MESHY_API_KEY = previous;
  }
});

test("Meshy polling accepts nullable placeholders while a task is running", async (context) => {
  const previous = process.env.MESHY_API_KEY;
  process.env.MESHY_API_KEY = "test-meshy-key";
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({
    id: "geometry-1",
    status: "IN_PROGRESS",
    progress: 42,
    model_urls: null,
    thumbnail_url: "",
    task_error: null,
  }));
  try {
    const task = await getMeshyTask("geometry-1");
    assert.deepEqual(task, {
      id: "geometry-1",
      status: "IN_PROGRESS",
      progress: 42,
      model_urls: undefined,
      thumbnail_url: undefined,
      task_error: undefined,
    });
  } finally {
    fetchMock.mock.restore();
    if (previous === undefined) delete process.env.MESHY_API_KEY;
    else process.env.MESHY_API_KEY = previous;
  }
});

test("workflow advances geometry to texturing and saves the completed GLB", async () => {
  let phase = 0;
  const dependencies: WorkflowDependencies = {
    createGeometry: async () => "geometry-1",
    createTexture: async () => "texture-1",
    getTask: async (taskId) => {
      if (taskId === "geometry-1") return { id: taskId, status: "SUCCEEDED", progress: 100 };
      return { id: taskId, status: "SUCCEEDED", progress: 100, model_urls: { glb: "https://assets.meshy.ai/scene.glb" }, thumbnail_url: "https://assets.meshy.ai/scene.png" };
    },
    saveAssets: async () => ({ modelPath: "3d-scenes/scene.glb", modelSizeBytes: 2048, thumbnailPath: "3d-scenes/scene.png", thumbnailMime: "image/png" }),
  };

  const geometry = await advanceSceneJob(fixture, dependencies);
  assert.equal(geometry.geometryTaskId, "geometry-1");
  phase += 1;
  const texturing = await advanceSceneJob({ ...fixture, ...geometry }, dependencies);
  assert.equal(texturing.textureTaskId, "texture-1");
  phase += 1;
  const ready = await advanceSceneJob({ ...fixture, ...geometry, ...texturing }, dependencies);
  assert.deepEqual({ status: ready.status, stage: ready.stage, progress: ready.progress, settled: ready.quotaUnitsSettled }, { status: "ready", stage: "ready", progress: 100, settled: 2 });
  assert.equal(phase, 2);
});

test("a storage retry reuses the completed provider task instead of regenerating", async () => {
  let providerSubmissions = 0;
  let storageAttempts = 0;
  const dependencies: WorkflowDependencies = {
    createGeometry: async () => { providerSubmissions += 1; return "unexpected"; },
    createTexture: async () => { providerSubmissions += 1; return "unexpected"; },
    getTask: async () => ({ id: "texture-1", status: "SUCCEEDED", progress: 100, model_urls: { glb: "https://assets.meshy.ai/scene.glb" } }),
    saveAssets: async () => {
      storageAttempts += 1;
      if (storageAttempts === 1) throw new Error("temporary blob failure");
      return { modelPath: "3d-scenes/scene.glb", modelSizeBytes: 100, thumbnailPath: undefined, thumbnailMime: undefined };
    },
  };
  const completedProviderJob = { ...fixture, status: "processing" as const, stage: "saving_model" as const, geometryTaskId: "geometry-1", textureTaskId: "texture-1" };
  await assert.rejects(() => advanceSceneJob(completedProviderJob, dependencies), /temporary blob failure/);
  const ready = await advanceSceneJob(completedProviderJob, dependencies);
  assert.equal(ready.status, "ready");
  assert.equal(providerSubmissions, 0);
  assert.equal(storageAttempts, 2);
});

test("failed geometry settles no reserved generation units", async () => {
  const dependencies: WorkflowDependencies = {
    createGeometry: async () => "unused",
    createTexture: async () => "unused",
    getTask: async () => ({ id: "geometry-1", status: "FAILED", progress: 28, task_error: { message: "Generation rejected." } }),
    saveAssets: async () => ({ modelPath: "unused", modelSizeBytes: 0, thumbnailPath: undefined, thumbnailMime: undefined }),
  };
  const failed = await advanceSceneJob({ ...fixture, geometryTaskId: "geometry-1" }, dependencies);
  assert.equal(failed.status, "failed");
  assert.equal(failed.quotaUnitsSettled, 0);
});

test("owner cookie is stable and the Supabase migration is private and durable", async () => {
  const first = sceneOwner(new Request("https://berrybox.example/api/3d-scenes"));
  assert.ok(first.setCookie?.includes("HttpOnly; SameSite=Lax; Secure"));
  const second = sceneOwner(new Request("https://berrybox.example/api/3d-scenes", { headers: { cookie: first.setCookie || "" } }));
  assert.equal(second.ownerId, first.ownerId);
  const migration = await readFile("db/migrations/001_create_3d_scene_jobs.sql", "utf8");
  assert.match(migration, /UNIQUE \(owner_id, submission_key\)/);
  assert.match(migration, /lease_expires_at/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL ON TABLE berrybox_3d_scene_jobs FROM anon, authenticated/);
  const store = await readFile("src/lib/3d-scenes/store.ts", "utf8");
  assert.match(store, /prepare: false/);
});

test("Hobby deployment uses owner-scoped polling with a daily cron fallback", async () => {
  const cron = JSON.parse(await readFile("vercel.json", "utf8")) as { crons: Array<{ schedule: string }> };
  assert.equal(cron.crons[0]?.schedule, "0 0 * * *");
  const route = await readFile("src/app/api/3d-scenes/[id]/route.ts", "utf8");
  assert.match(route, /processOwnedSceneJob\(id, owner\.ownerId\)/);
  const client = await readFile("src/components/scenes/scene-generator-page.tsx", "utf8");
  assert.match(client, /method: "POST"/);
});

test("the scene viewer exposes direct 360-degree camera controls", async () => {
  const viewer = await readFile("src/components/scenes/scene-model-viewer.tsx", "utf8");
  assert.match(viewer, /camera-controls/);
  assert.match(viewer, /viewer\.zoom\(amount\)/);
  assert.match(viewer, /cameraOrbit = "0deg 75deg 105%"/);
  assert.match(viewer, /auto-rotate-delay="300"/);
  assert.match(viewer, /rotation-per-second="32deg"/);
  assert.match(viewer, /LIVE 3D/);
});
