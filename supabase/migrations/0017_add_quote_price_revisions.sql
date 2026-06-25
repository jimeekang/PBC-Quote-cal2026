CREATE TABLE IF NOT EXISTS quote_price_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  revision_number INT NOT NULL CHECK (revision_number > 0),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated')),
  previous_subtotal NUMERIC(10,2) CHECK (previous_subtotal IS NULL OR previous_subtotal >= 0),
  previous_final_total NUMERIC(10,2) CHECK (previous_final_total IS NULL OR previous_final_total >= 0),
  new_subtotal NUMERIC(10,2) NOT NULL CHECK (new_subtotal >= 0),
  new_final_total NUMERIC(10,2) NOT NULL CHECK (new_final_total >= 0),
  previous_jobber_lines_total NUMERIC(10,2) CHECK (previous_jobber_lines_total IS NULL OR previous_jobber_lines_total >= 0),
  new_jobber_lines_total NUMERIC(10,2) CHECK (new_jobber_lines_total IS NULL OR new_jobber_lines_total >= 0),
  previous_options_subtotal NUMERIC(10,2) CHECK (previous_options_subtotal IS NULL OR previous_options_subtotal >= 0),
  new_options_subtotal NUMERIC(10,2) CHECK (new_options_subtotal IS NULL OR new_options_subtotal >= 0),
  previous_options_final_total NUMERIC(10,2) CHECK (previous_options_final_total IS NULL OR previous_options_final_total >= 0),
  new_options_final_total NUMERIC(10,2) CHECK (new_options_final_total IS NULL OR new_options_final_total >= 0),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quote_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_quote_price_revisions_quote
  ON quote_price_revisions(quote_id, revision_number);

CREATE INDEX IF NOT EXISTS idx_quote_price_revisions_changed_at
  ON quote_price_revisions(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_price_revisions_changed_by
  ON quote_price_revisions(changed_by);

ALTER TABLE quote_price_revisions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quote_price_revisions TO authenticated;

DROP POLICY IF EXISTS "authenticated_all" ON quote_price_revisions;

CREATE POLICY "authenticated_all" ON quote_price_revisions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
