ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS jobber_snapshot_refreshed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS jobber_snapshot_change_status TEXT NOT NULL DEFAULT 'unknown' CHECK (
    jobber_snapshot_change_status IN ('unknown', 'unchanged', 'changed')
  ),
  ADD COLUMN IF NOT EXISTS jobber_snapshot_change_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS jobber_snapshot_refresh_error TEXT;
