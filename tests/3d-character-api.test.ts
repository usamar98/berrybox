import assert from "node:assert/strict";
import { test } from "node:test";
import { GET, POST } from "../src/app/api/3d/characters/route";
import { getCharacterTask } from "../src/lib/3d/fal";

const endpoint = "http://localhost/api/3d/characters";
const characterModel = "meshy/v7/text-to-3d";
const alternateModel = "fal-ai/hyper3d/rodin/v2.5/text-to-3d";
const managedEnvironment = [
  "FAL_KEY",
  "FAL_3D_CHARACTER_MODELS",
  "BERRYBOX_ENABLE_3D_CHARACTER_GENERATION",
] as const;

function captureEnvironment() {
  return Object.fromEntries(managedEnvironment.map((name) => [name, process.env[name]]));
}

function restoreEnvironment(previous: ReturnType<typeof captureEnvironment>) {
  for (const name of managedEnvironment) {
    const value = previous[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

test("3D character status exposes the default fal model without credentials", async () => {
  const previous = captureEnvironment();
  try {
    delete process.env.FAL_KEY;
    delete process.env.FAL_3D_CHARACTER_MODELS;
    process.env.BERRYBOX_ENABLE_3D_CHARACTER_GENERATION = "false";
    const response = GET();
    const result = await response.json();

    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(result.available, false);
    assert.equal(result.provider, "fal.ai");
    assert.equal(result.output, "Rigged GLB");
    assert.equal(result.defaultModel, characterModel);
    assert.deepEqual(result.models.map((model: { id: string }) => model.id), [characterModel]);
    assert.equal("apiKey" in result, false);
  } finally {
    restoreEnvironment(previous);
  }
});

test("3D character endpoint validates origin, content type, schema, and body size before fal", async () => {
  assert.equal((await POST(new Request(endpoint, { method: "POST", body: "{}" }))).status, 415);
  assert.equal((await POST(jsonRequest("{}", { origin: "https://unrelated.invalid" }))).status, 403);
  assert.equal((await POST(jsonRequest("{"))).status, 400);
  assert.equal((await POST(jsonRequest("{}"))).status, 400);
  assert.equal((await POST(jsonRequest(JSON.stringify({ prompt: "x".repeat(5000) })))).status, 413);
});

test("enabled character generation submits the rigged animated fal character schema", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_3D_CHARACTER_GENERATION = "true";
  process.env.FAL_3D_CHARACTER_MODELS = `${characterModel},${alternateModel}`;
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ request_id: "character_12345678" }));

  try {
    const prompt = "An original stylized forest scout with clearly separated humanoid limbs";
    const response = await POST(jsonRequest(JSON.stringify({
      prompt,
      model: characterModel,
      poseMode: "t-pose",
      modelType: "lowpoly",
      heightMeters: 1.8,
      animate: true,
    })));

    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { taskId: "character_12345678", model: characterModel, status: "PENDING", provider: "fal.ai" });
    assert.equal(fetchMock.mock.callCount(), 1);

    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.match(String(url), /queue\.fal\.run\/meshy\/v7\/text-to-3d/);
    assert.equal(String(init.method).toUpperCase(), "POST");
    assert.deepEqual(JSON.parse(String(init.body)), {
      prompt,
      mode: "full",
      model_type: "lowpoly",
      topology: "quad",
      target_polycount: 24_000,
      should_remesh: true,
      symmetry_mode: "auto",
      enable_pbr: true,
      pose_mode: "t-pose",
      enable_prompt_expansion: true,
      enable_rigging: true,
      rigging_height_meters: 1.8,
      enable_animation: true,
      animation_action_id: 0,
      enable_safety_checker: true,
    });
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});

test("character generation rejects models outside the server allowlist", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_3D_CHARACTER_GENERATION = "true";
  process.env.FAL_3D_CHARACTER_MODELS = characterModel;
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ request_id: "unused" }));

  try {
    const response = await POST(jsonRequest(JSON.stringify({
      prompt: "An original stylized humanoid ranger with clearly separated limbs",
      model: alternateModel,
    })));
    assert.equal(response.status, 400);
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});

test("completed character tasks prefer the animated GLB and expose rigged downloads", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.FAL_3D_CHARACTER_MODELS = characterModel;
  const taskId = "character_87654321";
  const modelUrl = "https://storage.example/character/model.glb";
  const riggedModelUrl = "https://storage.example/character/rigged.glb";
  const animationUrl = "https://storage.example/character/idle.glb";
  const fbxUrl = "https://storage.example/character/idle.fbx";
  const thumbnailUrl = "https://storage.example/character/preview.png";
  const fetchMock = context.mock.method(globalThis, "fetch", async (url: string | URL | Request) => {
    if (String(url).endsWith(`/requests/${taskId}/status?logs=1`)) {
      return Response.json({
        status: "COMPLETED",
        request_id: taskId,
        response_url: "https://queue.fal.run/result",
        status_url: "https://queue.fal.run/status",
        cancel_url: "https://queue.fal.run/cancel",
        logs: [],
      });
    }
    return Response.json({
      model_glb: { url: modelUrl },
      rigged_character_glb: { url: riggedModelUrl },
      animation_glb: { url: animationUrl },
      animation_fbx: { url: fbxUrl },
      thumbnail: { url: thumbnailUrl },
    });
  });

  try {
    assert.deepEqual(await getCharacterTask(taskId, characterModel), {
      taskId,
      model: characterModel,
      status: "SUCCEEDED",
      progress: 100,
      modelUrl: animationUrl,
      thumbnailUrl,
      rigged: true,
      animated: true,
      animationUrl,
      riggedModelUrl,
      fbxUrl,
    });
    assert.equal(fetchMock.mock.callCount(), 2);
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});
