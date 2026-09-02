CREATE TABLE IF NOT EXISTS berrybox_3d_scene_jobs (
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
);

CREATE INDEX IF NOT EXISTS berrybox_scene_owner_created_idx ON berrybox_3d_scene_jobs (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS berrybox_scene_worker_idx ON berrybox_3d_scene_jobs (status, lease_expires_at, created_at);

ALTER TABLE berrybox_3d_scene_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE berrybox_3d_scene_jobs FROM anon, authenticated;
  END IF;
END;
$$;

COMMENT ON TABLE berrybox_3d_scene_jobs IS
  'Server-owned durable jobs for the BerryBox AI 3D Scene Generator.';
