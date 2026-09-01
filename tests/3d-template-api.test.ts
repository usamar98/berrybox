import assert from "node:assert/strict";
import { test } from "node:test";
import { GET, POST } from "../src/app/api/3d/templates/route";
import { getTemplateTask } from "../src/lib/3d/fal";

const endpoint = "http://localhost/api/3d/templates";
const primaryModel = "fal-ai/hunyuan3d-v3/text-to-3d";
const secondaryModel = "fal-ai/hunyuan-3d/v3.1/pro/text-to-3d";

const managedEnvironment = [
  "FAL_KEY",
  "FAL_3D_TEMPLATE_MODELS",
  "BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION",
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

test("3D template status exposes the fal model allowlist without exposing credentials", async () => {
  const previous = captureEnvironment();
  try {
    delete process.env.FAL_KEY;
    process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = "false";
    process.env.FAL_3D_TEMPLATE_MODELS = `${primaryModel},invalid model,${secondaryModel},${primaryModel}`;

    const response = GET();
    const result = await response.json();

    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(result.available, false);
    assert.equal(result.provider, "fal.ai");
    assert.equal(result.defaultModel, primaryModel);
    assert.deepEqual(result.models.map((model: { id: string }) => model.id), [primaryModel, secondaryModel]);
    assert.equal("apiKey" in result, false);
  } finally {
    restoreEnvironment(previous);
  }
});

test("3D template endpoint validates type, origin, schema, and streamed body size before fal", async () => {
  assert.equal((await POST(new Request(endpoint, { method: "POST", body: "{}" }))).status, 415);
  assert.equal((await POST(jsonRequest("{}", { origin: "https://unrelated.invalid" }))).status, 403);
  assert.equal((await POST(jsonRequest("{"))).status, 400);
  assert.equal((await POST(jsonRequest("{}"))).status, 400);
  assert.equal((await POST(jsonRequest(JSON.stringify({ prompt: "x".repeat(5000) })))).status, 413);
});

test("enabled 3D generation starts the selected fal queue model", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = "true";
  process.env.FAL_3D_TEMPLATE_MODELS = `${primaryModel},${secondaryModel}`;
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ request_id: "task_12345678" }));

  try {
    const prompt = "A modular stone portal for a fantasy game";
    const response = await POST(jsonRequest(JSON.stringify({ prompt, model: secondaryModel })));

    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), {
      taskId: "task_12345678",
      model: secondaryModel,
      status: "PENDING",
      provider: "fal.ai",
    });
    assert.equal(fetchMock.mock.callCount(), 1);

    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(String(init.method).toUpperCase(), "POST");
    assert.match(String(url), /queue\.fal\.run\/fal-ai\/hunyuan-3d\/v3\.1\/pro\/text-to-3d/);
    assert.deepEqual(JSON.parse(String(init.body)), { prompt });
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});

test("3D generation rejects fal models that are not in the deployment allowlist", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = "true";
  process.env.FAL_3D_TEMPLATE_MODELS = primaryModel;
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ request_id: "unused" }));

  try {
    const response = await POST(jsonRequest(JSON.stringify({
      prompt: "A modular stone portal for a fantasy game",
      model: secondaryModel,
    })));

    assert.equal(response.status, 400);
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});

test("completed fal tasks normalize a generated GLB and thumbnail for the viewer", async (context) => {
  const previous = captureEnvironment();
  process.env.FAL_KEY = "test-credential-not-a-real-key";
  process.env.FAL_3D_TEMPLATE_MODELS = primaryModel;
  const taskId = "task_87654321";
  const modelUrl = "https://storage.example/generated/portal.glb";
  const thumbnailUrl = "https://storage.example/generated/portal.webp";
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
    return Response.json({ model_glb: { url: modelUrl }, thumbnail: { url: thumbnailUrl } });
  });

  try {
    assert.deepEqual(await getTemplateTask(taskId, primaryModel), {
      taskId,
      model: primaryModel,
      status: "SUCCEEDED",
      progress: 100,
      modelUrl,
      thumbnailUrl,
    });
    assert.equal(fetchMock.mock.callCount(), 2);
  } finally {
    fetchMock.mock.restore();
    restoreEnvironment(previous);
  }
});
