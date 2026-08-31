# BerryBox

A game-creation workspace built with Next.js, React, TypeScript, Tailwind CSS, Three.js, and OpenAI.

## Pages

- `/` — three-card launch hub.
- `/templates` — Templates + AI Builder alpha: two working templates, search, and browser-local saved projects.
- `/editor?template=explorer` — Crystal Grove, a 3D collection arena.
- `/editor?template=runner` — Neon Rush, a 3D obstacle course.
- `/play?template=explorer` (or `runner`) — playable template preview.
- `/characters` — 3D Character Creator beta, **Coming soon**.
- `/workflow` — connected creation workflow, **Coming soon**.
- Existing gallery, pricing, and roadmap pages are legacy concept pages, not active product capabilities.

## Run locally

Use Node.js 22 or later. Install with `npm install`, copy the variable names from `.env.example` into an ignored `.env.local`, and configure your own OpenAI API key. Never commit real credentials.

Run `npm run dev` with `NODE_ENV=development`. Open the URL printed by Next.js (usually port 3000; a configured PORT may change it). Templates, manual editing, and project backups work without AI access.

The default AI model is `gpt-4.1-mini`; set `OPENAI_MODEL` to use another Responses API model with Structured Outputs support. The API key stays server-side. AI edits send only the entered prompt and current game settings, request no storage, validate model output, and never execute generated code.

## What the alpha does

- Real 3D movement, jumping, collectibles, patrol/chase/guard enemies, health, timers, and win/lose states.
- WASD or arrow keys to move; Space to jump; on-screen touch controls. The preview pauses on focus loss.
- AI-assisted changes to supported settings, plus manual editing and a 20-step undo history.
- Explicit save/reopen for up to 50 projects in this browser. JSON import creates a new copy; export makes a portable BerryBox project backup.
- Descriptive error states for failed AI requests, missing projects, blocked storage, and unavailable WebGL 2.

JSON export is **not** a standalone HTML game. There is no cloud saving, authentication, public publishing, 3D character generation, or arbitrary-code generation yet. Back up important projects before clearing browser data.

## AI and production safety

AI is enabled in development when a key is present. Production API calls are disabled by default. Only set `BERRYBOX_ENABLE_ALPHA_AI=true` after putting the deployment behind authentication and adding durable per-user quotas and provider spending limits. The included 12-requests-per-minute / 2-concurrent-request guard is per process, not a distributed production rate limiter. Origin checks do not replace authentication.

OpenAI credit exhaustion is shown as a billing issue, not silently replaced with a fake AI result. Add API credits or review the account quota to restore AI editing. Templates and manual controls remain available.

The legacy `/api/games/generate` URL now uses the same guarded handler as `/api/studio/generate`; both accept `{ prompt, config }`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

Tests cover schema limits, template selection, movement, enemies, jumping, collisions, completion, persistence, API validation, mocked provider responses, and the production opt-in guard.

Optional **live, billable** AI verification with the dev server running:

```bash
node scripts/smoke-ai.mjs
```

Set `BERRYBOX_TEST_URL` if your server is not on port 3001. This check is deliberately not part of the default test suite.

