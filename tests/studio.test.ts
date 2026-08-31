import assert from "node:assert/strict";
import { test } from "node:test";
import { GameConfigSchema, getTemplate, parseProjects, templates, upsertProject } from "../src/lib/studio/config";
import { createWorld, stepWorld, spawn, portal } from "../src/lib/studio/world";
import { GET, POST, aiAvailable } from "../src/lib/studio/ai-service";

const idle = { x: 0, z: 0, jump: false };
test("both templates validate, unknown templates safely resolve, and worlds start playable", () => {
  for (const template of templates) {
    assert.equal(GameConfigSchema.safeParse(template.config).success, true);
    const world = createWorld(template.config);
    assert.equal(world.status, "playing");
    assert.equal(world.crystals.length, template.config.collectibleCount);
    assert.equal(world.enemies.length, template.config.enemyCount);
  }
  assert.equal(getTemplate("not-real").id, "explorer");
  assert.equal(GameConfigSchema.safeParse({ ...templates[0].config, enemyCount: 100 }).success, false);
});
test("movement is frame based, diagonal normalized, and constrained to the arena", () => {
  const config = { ...templates[0].config, enemyCount: 0 };
  const world = createWorld(config);
  stepWorld(world, config, { x: 1, z: -1, jump: false }, .05);
  assert.ok(Math.abs(Math.hypot(world.player.x, world.player.z - spawn.z) - config.moveSpeed * .05) < 1e-9);
  for (let index = 0; index < 200; index++) stepWorld(world, config, { x: 1, z: 0, jump: false }, .05);
  assert.ok(world.player.x <= 11);
});
test("enemy behaviors move and chase the player, not just animate", () => {
  for (const behavior of ["chase", "patrol"] as const) {
    const config = { ...templates[0].config, behavior };
    const world = createWorld(config);
    const enemy = { ...world.enemies[0] };
    stepWorld(world, config, idle, .05);
    assert.notDeepEqual(world.enemies[0], enemy);
    if (behavior === "chase") assert.ok(Math.hypot(world.enemies[0].x - world.player.x, world.enemies[0].z - world.player.z) < Math.hypot(enemy.x - world.player.x, enemy.z - world.player.z));
  }
});
test("collision damages and respawns once during the invulnerability period", () => {
  const config = { ...templates[0].config, behavior: "guard" as const };
  const world = createWorld(config);
  world.enemies[0].x = world.player.x;
  world.enemies[0].z = world.player.z;
  stepWorld(world, config, idle, .01);
  assert.equal(world.health, config.health - 1);
  stepWorld(world, config, idle, .01);
  assert.equal(world.health, config.health - 1);
});
test("explorer can complete; runner requires both crystals and the finish portal", () => {
  for (const template of templates) {
    const config = { ...template.config, enemyCount: 0 };
    const world = createWorld(config);
    for (const crystal of world.crystals) {
      Object.assign(world.player, { x: crystal.x, z: crystal.z });
      stepWorld(world, config, idle, .01);
    }
    if (config.template === "runner") {
      assert.equal(world.status, "playing");
      Object.assign(world.player, portal);
      stepWorld(world, config, idle, .01);
    }
    assert.equal(world.status, "won");
    const elapsed = world.elapsed;
    stepWorld(world, config, idle, .05);
    assert.equal(world.elapsed, elapsed);
  }
});
test("runner barriers block ground movement but can be jumped", () => {
  const config = { ...templates[1].config, enemyCount: 0 };
  const world = createWorld(config);
  world.player.x = world.barriers[0].x;
  world.player.z = world.barriers[0].z + .8;
  stepWorld(world, config, { x: 0, z: -1, jump: false }, .05);
  assert.equal(world.player.z, world.barriers[0].z + .8);
  for (let index = 0; index < 8; index++) stepWorld(world, config, { x: 0, z: -1, jump: true }, .05);
  assert.ok(world.player.y >= .9);
  assert.ok(world.player.z < world.barriers[0].z + .8);
});
test("timeout and health loss end a game", () => {
  const config = templates[0].config;
  const world = createWorld(config);
  world.elapsed = config.timeLimit;
  stepWorld(world, config, idle, .01);
  assert.equal(world.status, "lost");
});
test("project updates preserve other projects and invalid storage is not silently discarded", () => {
  const project = { version: 1 as const, id: "one", updatedAt: new Date().toISOString(), config: templates[0].config };
  const second = { ...project, id: "two" };
  const saved = upsertProject([project, second], { ...project, config: templates[1].config });
  assert.equal(saved.length, 2);
  assert.equal(saved[0].config.template, "runner");
  assert.equal(saved[1].id, "two");
  assert.deepEqual(parseProjects(JSON.stringify(saved)), saved);
  assert.throws(() => parseProjects("broken-json"));
  assert.throws(() => parseProjects('[{"version":99}]'));
  assert.deepEqual(parseProjects(null), []);
});
test("API rejects invalid JSON, invalid schema, excessive bodies and foreign origins before AI", async () => {
  const send = (body: string, headers: Record<string, string> = {}) => POST(new Request("http://localhost/api/studio/generate", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body }));
  assert.equal((await send("{")).status, 400);
  assert.equal((await send("{}")).status, 400);
  assert.equal((await send("x".repeat(9000))).status, 413);
  assert.equal((await send("{}", { origin: "https://unrelated.invalid" })).status, 403);
  assert.equal((await POST(new Request("http://localhost/api/studio/generate", { method: "POST", body: "{}" }))).status, 415);
  const status = await GET();
  assert.equal(status.headers.get("cache-control"), "no-store");
  assert.equal(typeof (await status.json()).available, "boolean");
});

test("AI endpoint validates a structured success response and classifies exhausted credits", async (context) => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalEnable = process.env.BERRYBOX_ENABLE_ALPHA_AI;
  process.env.OPENAI_API_KEY = "test-credential-not-a-real-key";
  process.env.BERRYBOX_ENABLE_ALPHA_AI = "true";
  const config = { ...templates[0].config, theme: "desert" as const };
  const fetchMock = context.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    id: "resp_test", object: "response", status: "completed", created_at: 0,
    output: [{ id: "msg_test", type: "message", role: "assistant", status: "completed",
      content: [{ type: "output_text", text: JSON.stringify({ config, message: "Changed the theme to desert." }), annotations: [] }] }],
  }), { status: 200, headers: { "Content-Type": "application/json" } }));
  const request = () => new Request("http://localhost/api/studio/generate", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "Make it desert", config: templates[0].config }) });
  try {
    const success = await POST(request());
    assert.equal(success.status, 200);
    assert.equal((await success.json()).config.theme, "desert");
    fetchMock.mock.mockImplementation(async () => new Response(JSON.stringify({
      error: { message: "Test credit error", type: "insufficient_quota", code: "credit_balance_exhausted" },
    }), { status: 429, headers: { "Content-Type": "application/json" } }));
    const failed = await POST(request());
    assert.equal(failed.status, 429);
    const result = await failed.json();
    assert.match(result.error, /credits are exhausted/);
    assert.equal(result.config, undefined);
    assert.equal(result.source, undefined);
  } finally {
    fetchMock.mock.restore();
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
    if (originalEnable === undefined) delete process.env.BERRYBOX_ENABLE_ALPHA_AI; else process.env.BERRYBOX_ENABLE_ALPHA_AI = originalEnable;
  }
});

test("production AI is opt-in rather than exposing credits by default", () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, OPENAI_API_KEY: process.env.OPENAI_API_KEY, BERRYBOX_ENABLE_ALPHA_AI: process.env.BERRYBOX_ENABLE_ALPHA_AI };
  try {
    Object.assign(process.env, { NODE_ENV: "production", OPENAI_API_KEY: "test-not-real", BERRYBOX_ENABLE_ALPHA_AI: "false" });
    assert.equal(aiAvailable(), false);
    process.env.BERRYBOX_ENABLE_ALPHA_AI = "true";
    assert.equal(aiAvailable(), true);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
