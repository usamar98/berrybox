# BerryBox

BerryBox is a Next.js 16 creator experience centered on a durable AI 3D Scene Generator. It turns one prompt into a compact textured scene, saves the resulting GLB privately, and keeps a browser-owned generation history.

## Active product

- `/ai-3d-scene-generator` — prompt, real generation progress, interactive `<model-viewer>` preview, private history, deletion, and GLB download.
- `/api/3d-scenes` — creates idempotent jobs and returns paginated browser-owned history.
- `/api/3d-scenes/[id]` — returns or deletes one owned terminal job.
- `/api/3d-scenes/[id]/model` — streams an owned GLB inline to the viewer.
- `/api/3d-scenes/[id]/download` — streams an owned GLB with an attachment filename.
- `/api/3d-scenes/[id]/thumbnail` — streams an owned thumbnail.
- `/api/cron/3d-scenes` — advances durable Meshy jobs in bounded batches.

The old Fal-backed template and character generators and their API routes have been removed. Character, template, and complete-game generation remain roadmap concepts only.

## Generation workflow

1. The submission route validates the prompt, applies a daily browser quota and global concurrency limit, and creates a PostgreSQL job before any paid provider call.
2. The Vercel cron worker claims jobs with a database lease so concurrent invocations cannot submit the same stage.
3. Meshy preview mode creates geometry using the configured model, triangle topology, remeshing, and a 30,000 polygon target.
4. After the preview succeeds, Meshy refine mode creates 2K PBR textures and a GLB.
5. The worker validates Meshy asset hosts, performs bounded downloads, and copies the GLB and thumbnail into private Vercel Blob storage.
6. Only after the required GLB is stored does the job become Ready.

The browser only polls BerryBox job status. Closing it does not stop generation. Ambiguous paid POST failures are marked `review_required` instead of being blindly resubmitted. Storage failures retry from the completed Meshy task without regenerating the scene.

## Ownership and limits

This repository does not yet contain user authentication or billing. BerryBox therefore assigns an opaque, HTTP-only, SameSite owner cookie to each browser. Every history, status, model, thumbnail, download, and deletion route checks that owner ID server-side.

The default allowance is three jobs per browser in 24 hours with two active jobs globally. These are application quotas, not a statement of Meshy provider cost. Change them with the server-only environment variables below. Replace the anonymous cookie owner with your account user ID when authentication is introduced.

## Required services

1. Create a Meshy API key.
2. Connect a PostgreSQL provider through the Vercel Marketplace and expose `DATABASE_URL`. For Supabase on Vercel, use the transaction pooler; the server disables prepared statements for Supavisor compatibility.
3. Create and connect a **private** Vercel Blob store.
4. Add a random `CRON_SECRET` of at least 16 characters.
5. Deploy. `vercel.json` invokes the worker every minute.

The application creates its table defensively on first use. The equivalent reviewed migration is at `db/migrations/001_create_3d_scene_jobs.sql` for teams that run migrations separately.

## Environment variables

Copy `.env.example` to `.env.local` and configure:

```text
MESHY_API_KEY=<server-only Meshy key>
MESHY_TEXT_TO_3D_MODEL=meshy-7
DATABASE_URL=<PostgreSQL connection string>
BLOB_READ_WRITE_TOKEN=<private Vercel Blob token>
CRON_SECRET=<random secret, at least 16 characters>

MESHY_DAILY_SCENE_QUOTA=3
MESHY_GLOBAL_CONCURRENCY=2
MESHY_WORKER_BATCH_SIZE=2
MESHY_MAX_MODEL_BYTES=100000000
MESHY_MAX_THUMBNAIL_BYTES=8000000
```

Supported model values are `meshy-5`, `meshy-6`, `meshy-7`, and `latest`; an unknown value falls back to `meshy-7`. Keys and provider URLs are never returned to the browser.

## Local development

Use Node.js 22 or later:

```bash
npm install
npm run dev
```

With the required services configured, advance jobs locally by invoking the worker with the same secret:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/3d-scenes
```

Run the quality gates:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Live Meshy generation consumes provider credits. It should only be tested after the real key, database, private Blob store, cron secret, and account spending controls are configured.
