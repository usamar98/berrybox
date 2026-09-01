import assert from "node:assert/strict";
import { test } from "node:test";
import { GET, POST } from "../src/app/api/3d/templates/route";

const endpoint = "http://localhost/api/3d/templates";

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

test("3D template status does not expose credentials and is disabled by default", async () => {
  const previousKey = process.env.MESHY_API_KEY;
  const previousEnable = process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION;
  try {
    delete process.env.MESHY_API_KEY;
    process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = "false";
    const response = GET();
    const result = await response.json();
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(result.available, false);
    assert.equal(result.provider, "Meshy");
    assert.equal("apiKey" in result, false);
  } finally {
    if (previousKey === undefined) delete process.env.MESHY_API_KEY; else process.env.MESHY_API_KEY = previousKey;
    if (previousEnable === undefined) delete process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION; else process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = previousEnable;
  }
});

test("3D template endpoint validates type, origin, schema, and streamed body size before Meshy", async () => {
  assert.equal((await POST(new Request(endpoint, { method: "POST", body: "{}" }))).status, 415);
  assert.equal((await POST(jsonRequest("{}", { origin: "https://unrelated.invalid" }))).status, 403);
  assert.equal((await POST(jsonRequest("{"))).status, 400);
  assert.equal((await POST(jsonRequest("{}"))).status, 400);
  assert.equal((await POST(jsonRequest(JSON.stringify({ prompt: "x".repeat(5000) })))).status, 413);
});

test("enabled 3D generation starts a Meshy preview GLB task", async (context) => {
  const previousKey = process.env.MESHY_API_KEY;
  const previousEnable = process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION;
  process.env.MESHY_API_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = "true";
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ result: "task_12345678" }));

  try {
    const response = await POST(jsonRequest(JSON.stringify({ prompt: "A modular stone portal for a fantasy game" })));
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { taskId: "task_12345678", status: "PENDING", provider: "Meshy" });
    assert.equal(fetchMock.mock.callCount(), 1);
    const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(url, "https://api.meshy.ai/openapi/v2/text-to-3d");
    assert.equal(init.method, "POST");
    assert.deepEqual(JSON.parse(String(init.body)), {
      mode: "preview",
      prompt: "A modular stone portal for a fantasy game",
      should_remesh: true,
      target_polycount: 30_000,
      target_formats: ["glb"],
    });
  } finally {
    fetchMock.mock.restore();
    if (previousKey === undefined) delete process.env.MESHY_API_KEY; else process.env.MESHY_API_KEY = previousKey;
    if (previousEnable === undefined) delete process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION; else process.env.BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION = previousEnable;
  }
});
