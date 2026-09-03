import { randomUUID } from "node:crypto";
import postgres, { type Sql } from "postgres";
import { characterConfig, databaseUrl } from "./config";
import type { CharacterJob, CharacterSettings } from "./types";

type Row = Record<string, unknown>;
type JobPatch = Partial<Pick<CharacterJob,
  | "status" | "stage" | "progress" | "geometryTaskId" | "textureTaskId"
  | "modelBlobPath" | "thumbnailBlobPath" | "thumbnailMime" | "modelSizeBytes"
  | "errorCode" | "errorMessage" | "quotaUnitsSettled" | "completedAt"
>>;

export class CharacterStoreError extends Error {
  constructor(public readonly code: "configuration" | "quota" | "busy" | "not_found", message: string) {
    super(message);
    this.name = "CharacterStoreError";
  }
}

let client: Sql | undefined;
let schemaPromise: Promise<void> | undefined;

function sqlClient() {
  const url = databaseUrl();
  if (!url) throw new CharacterStoreError("configuration", "Connect a PostgreSQL database before generating characters.");
  if (!client) {
    const local = /(?:localhost|127\.0\.0\.1)/i.test(url);
    client = postgres(url, { max: 3, idle_timeout: 20, ssl: local ? false : "require", prepare: false });
  }
  return client;
}

export async function ensureCharacterSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = sqlClient();
      await sql`
        CREATE TABLE IF NOT EXISTS berrybox_3d_character_jobs (
          id uuid PRIMARY KEY,
          owner_id uuid NOT NULL,
          original_prompt text NOT NULL,
          submitted_prompt text NOT NULL,
          model text NOT NULL,
          settings jsonb NOT NULL DEFAULT '{}'::jsonb,
          status text NOT NULL,
          stage text NOT NULL,
          progress integer NOT NULL DEFAULT 0,
          geometry_task_id text,
          texture_task_id text,
          model_blob_path text,
          thumbnail_blob_path text,
          thumbnail_mime text,
          model_size_bytes bigint,
          error_code text,
          error_message text,
          submission_key uuid NOT NULL,
          quota_units_reserved integer NOT NULL DEFAULT 2,
          quota_units_settled integer NOT NULL DEFAULT 0,
          attempts integer NOT NULL DEFAULT 0,
          lease_token uuid,
          lease_expires_at timestamptz,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          completed_at timestamptz,
          UNIQUE (owner_id, submission_key)
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS berrybox_character_owner_created_idx ON berrybox_3d_character_jobs (owner_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS berrybox_character_worker_idx ON berrybox_3d_character_jobs (status, lease_expires_at, created_at)`;
      await sql`ALTER TABLE berrybox_3d_character_jobs ENABLE ROW LEVEL SECURITY`;
      await sql`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
            AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
            REVOKE ALL ON TABLE berrybox_3d_character_jobs FROM anon, authenticated;
          END IF;
        END;
        $$
      `;
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function dateValue(value: unknown) {
  if (!value) return undefined;
  return (value instanceof Date ? value : new Date(String(value))).toISOString();
}

function rowToJob(row: Row): CharacterJob {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    originalPrompt: String(row.original_prompt),
    submittedPrompt: String(row.submitted_prompt),
    model: String(row.model),
    settings: row.settings as CharacterSettings,
    status: row.status as CharacterJob["status"],
    stage: row.stage as CharacterJob["stage"],
    progress: Number(row.progress),
    geometryTaskId: stringValue(row.geometry_task_id),
    textureTaskId: stringValue(row.texture_task_id),
    modelBlobPath: stringValue(row.model_blob_path),
    thumbnailBlobPath: stringValue(row.thumbnail_blob_path),
    thumbnailMime: stringValue(row.thumbnail_mime),
    modelSizeBytes: row.model_size_bytes == null ? undefined : Number(row.model_size_bytes),
    errorCode: stringValue(row.error_code),
    errorMessage: stringValue(row.error_message),
    submissionKey: String(row.submission_key),
    quotaUnitsReserved: Number(row.quota_units_reserved),
    quotaUnitsSettled: Number(row.quota_units_settled),
    attempts: Number(row.attempts),
    leaseToken: stringValue(row.lease_token),
    createdAt: dateValue(row.created_at) || new Date().toISOString(),
    updatedAt: dateValue(row.updated_at) || new Date().toISOString(),
    completedAt: dateValue(row.completed_at),
  };
}

export async function createCharacterJob(input: {
  ownerId: string;
  originalPrompt: string;
  submittedPrompt: string;
  model: string;
  submissionKey: string;
  settings: CharacterSettings;
}) {
  await ensureCharacterSchema();
  const sql = sqlClient();
  const config = characterConfig();
  return sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(hashtext(${`character:${input.ownerId}`}))`;
    const duplicate = await transaction`SELECT * FROM berrybox_3d_character_jobs WHERE owner_id = ${input.ownerId} AND submission_key = ${input.submissionKey} LIMIT 1`;
    if (duplicate[0]) return rowToJob(duplicate[0] as Row);

    const [usage] = await transaction`
      SELECT count(*)::integer AS daily_count FROM berrybox_3d_character_jobs
      WHERE owner_id = ${input.ownerId} AND created_at >= now() - interval '24 hours'
        AND (status IN ('queued', 'processing', 'ready') OR quota_units_settled > 0)
    `;
    if (Number(usage.daily_count) >= config.dailyQuota) {
      throw new CharacterStoreError("quota", `Daily character allowance reached (${config.dailyQuota} generations per browser).`);
    }

    const [active] = await transaction`SELECT count(*)::integer AS active_count FROM berrybox_3d_character_jobs WHERE status IN ('queued', 'processing')`;
    if (Number(active.active_count) >= config.globalConcurrency) {
      throw new CharacterStoreError("busy", "The character queue is currently full. Try again shortly.");
    }

    const id = randomUUID();
    const rows = await transaction`
      INSERT INTO berrybox_3d_character_jobs (
        id, owner_id, original_prompt, submitted_prompt, model, settings,
        status, stage, progress, submission_key, quota_units_reserved
      ) VALUES (
        ${id}, ${input.ownerId}, ${input.originalPrompt}, ${input.submittedPrompt}, ${input.model},
        ${transaction.json(input.settings)}, 'queued', 'queued', 0, ${input.submissionKey}, 2
      ) RETURNING *
    `;
    return rowToJob(rows[0] as Row);
  });
}

export async function listCharacterJobs(ownerId: string, page: number, pageSize: number) {
  await ensureCharacterSchema();
  const sql = sqlClient();
  const offset = (page - 1) * pageSize;
  const [countRow, rows] = await Promise.all([
    sql`SELECT count(*)::integer AS total FROM berrybox_3d_character_jobs WHERE owner_id = ${ownerId}`,
    sql`SELECT * FROM berrybox_3d_character_jobs WHERE owner_id = ${ownerId} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
  ]);
  return { jobs: rows.map((row) => rowToJob(row as Row)), total: Number(countRow[0].total) };
}

export async function getCharacterJob(id: string, ownerId?: string) {
  await ensureCharacterSchema();
  const sql = sqlClient();
  const rows = ownerId
    ? await sql`SELECT * FROM berrybox_3d_character_jobs WHERE id = ${id} AND owner_id = ${ownerId} LIMIT 1`
    : await sql`SELECT * FROM berrybox_3d_character_jobs WHERE id = ${id} LIMIT 1`;
  return rows[0] ? rowToJob(rows[0] as Row) : undefined;
}

function databasePatch(patch: JobPatch) {
  const values: Record<string, unknown> = { updated_at: new Date() };
  const fields: Array<[keyof JobPatch, string]> = [
    ["status", "status"], ["stage", "stage"], ["progress", "progress"],
    ["geometryTaskId", "geometry_task_id"], ["textureTaskId", "texture_task_id"],
    ["modelBlobPath", "model_blob_path"], ["thumbnailBlobPath", "thumbnail_blob_path"],
    ["thumbnailMime", "thumbnail_mime"], ["modelSizeBytes", "model_size_bytes"],
    ["errorCode", "error_code"], ["errorMessage", "error_message"],
    ["quotaUnitsSettled", "quota_units_settled"], ["completedAt", "completed_at"],
  ];
  for (const [source, target] of fields) if (source in patch) values[target] = patch[source] ?? null;
  return values;
}

export async function updateClaimedCharacterJob(id: string, leaseToken: string, patch: JobPatch) {
  const sql = sqlClient();
  const values = databasePatch(patch);
  values.lease_token = null;
  values.lease_expires_at = null;
  const rows = await sql`UPDATE berrybox_3d_character_jobs SET ${sql(values)} WHERE id = ${id} AND lease_token = ${leaseToken} RETURNING *`;
  if (!rows[0]) throw new CharacterStoreError("not_found", "The character worker lease expired.");
  return rowToJob(rows[0] as Row);
}

export async function claimNextCharacterJob() {
  await ensureCharacterSchema();
  const sql = sqlClient();
  const leaseToken = randomUUID();
  const rows = await sql`
    WITH candidate AS (
      SELECT id FROM berrybox_3d_character_jobs
      WHERE status IN ('queued', 'processing') AND (lease_expires_at IS NULL OR lease_expires_at < now())
      ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1
    )
    UPDATE berrybox_3d_character_jobs AS jobs
    SET lease_token = ${leaseToken}, lease_expires_at = now() + interval '4 minutes', attempts = attempts + 1, updated_at = now()
    FROM candidate WHERE jobs.id = candidate.id RETURNING jobs.*
  `;
  return rows[0] ? rowToJob(rows[0] as Row) : undefined;
}

export async function claimOwnedCharacterJob(id: string, ownerId: string) {
  await ensureCharacterSchema();
  const sql = sqlClient();
  const leaseToken = randomUUID();
  const rows = await sql`
    UPDATE berrybox_3d_character_jobs
    SET lease_token = ${leaseToken}, lease_expires_at = now() + interval '4 minutes', attempts = attempts + 1, updated_at = now()
    WHERE id = ${id} AND owner_id = ${ownerId} AND status IN ('queued', 'processing')
      AND (lease_expires_at IS NULL OR lease_expires_at < now()) RETURNING *
  `;
  return rows[0] ? rowToJob(rows[0] as Row) : undefined;
}

export async function deleteCharacterJob(id: string, ownerId: string) {
  const sql = sqlClient();
  const rows = await sql`
    DELETE FROM berrybox_3d_character_jobs
    WHERE id = ${id} AND owner_id = ${ownerId} AND status IN ('ready', 'failed', 'canceled', 'review_required') RETURNING *
  `;
  return rows[0] ? rowToJob(rows[0] as Row) : undefined;
}
