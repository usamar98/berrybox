import assert from "node:assert/strict";

// Opt-in live check. Uses the running server's credentials; never reads or prints them.
const base = process.env.BERRYBOX_TEST_URL || "http://localhost:3001";
const response = await fetch(base + "/api/studio/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({
    prompt: "Change only the theme to desert, the player color to violet, and enemyCount to 3.",
    config: {
      title: "Crystal Grove", template: "explorer", theme: "forest", playerColor: "mint",
      moveSpeed: 5, health: 3, collectibleCount: 6, enemyCount: 2, enemySpeed: 1,
      behavior: "patrol", timeLimit: 120,
    },
  }),
  signal: AbortSignal.timeout(60_000),
});
const result = await response.json();
if (!response.ok) {
  console.error("AI smoke check:", response.status, result.error);
  process.exitCode = 1;
} else {
  assert.equal(result.source, "openai");
  assert.equal(result.config.theme, "desert");
  assert.equal(result.config.playerColor, "violet");
  assert.equal(result.config.enemyCount, 3);
  assert.equal(result.config.collectibleCount, 6);
  assert.equal(result.config.template, "explorer");
  console.log("Live OpenAI edit passed: requested fields updated and unrelated settings preserved.");
}
