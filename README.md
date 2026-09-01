# BerryBox

A prompt-to-3D creator workspace built with Next.js, React, TypeScript, Three.js, Meshy, Tripo, and OpenAI.

## Pages and APIs

- `/` — product site with the three focused prompt-based 3D features.
- `/templates` — enabled AI 3D Template Generator with Meshy task polling and an interactive GLB viewer.
- `/characters` — prompt-to-3D Character Generator, **Coming soon**.
- `/workflow` — prompt-to-3D Game Generator, **Coming soon**.
- `/api/3d/templates` — Meshy readiness and task creation.
- `/api/3d/templates/[id]` — normalized Meshy task status and GLB result.
- `/api/3d/providers` — provider readiness without exposing API keys.
- `/editor` and `/play` remain internal 3D prototype routes, but are not presented as active product features.

## Run locally

Use Node.js 22 or later. Install with `npm install`, copy the variable names from `.env.example` into an ignored `.env.local`, and configure your provider keys. Never commit credentials.

Run `npm run dev` and open the URL printed by Next.js. The 3D viewer works without a provider key; generation requires the Meshy variables below.

## Vercel environment variables

Set these for Production, Preview, and Development as appropriate, then redeploy:

```text
MESHY_API_KEY=<server-only Meshy key>
BERRYBOX_ENABLE_3D_TEMPLATE_GENERATION=true
TRIPO_API_KEY=<server-only Tripo key for the coming character feature>
OPENAI_API_KEY=<server-only OpenAI key for the coming game feature>
PEXELS_API_KEY=<optional future source-video search key>
```

Never prefix provider keys with `NEXT_PUBLIC_`. The app exposes only boolean readiness through `/api/3d/providers`.

## What works now

- Sends a validated text prompt to Meshy's Text-to-3D preview endpoint.
- Polls the asynchronous provider task without exposing credentials.
- Loads the returned GLB in a custom Three.js viewer with orbit, zoom, pan, lighting, automatic framing, and direct download.
- Links to free-source libraries: Poly Haven and Kenney (CC0), and Pexels video content under the Pexels license.
- Keeps prompt-to-character and prompt-to-game features visibly locked as coming soon.

Generated files are hosted by the provider and may use expiring signed URLs. Download results you want to keep. BerryBox does not provide permanent model storage, authentication, character generation, or complete game generation yet.

## Generation safety

Meshy generation requires both the key and explicit feature flag. The included same-origin check and per-process guard are only an alpha safety layer; before public launch, add authentication, durable per-user quotas, and provider spending limits.

Provider errors are normalized without returning raw provider messages, prompts, or secrets to the browser.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```
