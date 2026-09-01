# BerryBox

A prompt-to-3D creator workspace built with Next.js, React, TypeScript, Three.js, fal.ai, and OpenAI.

## Pages and APIs

- `/` — product site with the three focused prompt-based 3D features.
- `/templates` — enabled AI 3D Template Generator with a configurable fal model selector and an interactive GLB viewer.
- `/characters` — prompt-to-3D Character Generator, **Coming soon**.
- `/workflow` — prompt-to-3D Game Generator, **Coming soon**.
- `/api/3d/templates` — fal readiness, configured model catalog, and queued task creation.
- `/api/3d/templates/[id]` — normalized fal queue status and GLB result.
- `/api/3d/providers` — provider readiness without exposing API keys.
- `/editor` and `/play` remain internal 3D prototype routes, but are not presented as active product features.

## Run locally

Use Node.js 22 or later. Install with `npm install`, copy the variable names from `.env.example` into an ignored `.env.local`, and configure your provider keys. Never commit credentials.

Run `npm run dev` and open the URL printed by Next.js. The 3D viewer works without a provider key; generation requires the fal variables below.

## Vercel environment variables

Set these for Production, Preview, and Development as appropriate, then redeploy:

```text
FAL_KEY=<server-only fal key>
BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION=true
FAL_3D_TEMPLATE_MODELS=fal-ai/hunyuan3d-v3/text-to-3d
FAL_3D_CHARACTER_MODELS=<optional comma-separated fal endpoints for the coming character feature>
FAL_3D_GAME_MODELS=<optional comma-separated fal endpoints for the coming game feature>
OPENAI_API_KEY=<server-only OpenAI key for the coming game feature>
PEXELS_API_KEY=<optional future source-video search key>
```

Never prefix provider keys with `NEXT_PUBLIC_`. The app exposes only readiness and the configured public model IDs through `/api/3d/providers`.

`FAL_3D_TEMPLATE_MODELS` accepts up to 12 comma-separated fal endpoint IDs. The first model is the default, and every configured model appears in the generator selector. Only endpoints that accept a `prompt` input and return a GLB should be added to this group. Model IDs are checked against the server allowlist before any paid request is submitted.

## What works now

- Sends a validated text prompt to the selected, server-approved fal text-to-3D endpoint.
- Polls the asynchronous fal queue without exposing credentials.
- Loads the returned GLB in a custom Three.js viewer with orbit, zoom, pan, lighting, automatic framing, and direct download.
- Links to free-source libraries: Poly Haven and Kenney (CC0), and Pexels video content under the Pexels license.
- Keeps prompt-to-character and prompt-to-game features visibly locked as coming soon.

Generated files are hosted by the provider and may use expiring signed URLs. Download results you want to keep. BerryBox does not provide permanent model storage, authentication, character generation, or complete game generation yet.

## Generation safety

fal generation requires the key, an approved model ID, and the explicit feature flag. The included same-origin check and per-process guard are only an alpha safety layer; before public launch, add authentication, durable per-user quotas, and fal spending limits.

Provider errors are normalized without returning raw provider messages, prompts, or secrets to the browser.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```
