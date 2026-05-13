CREATE TABLE quote_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('interior', 'exterior')),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scope, name)
);

CREATE INDEX idx_quote_areas_active_scope
  ON quote_areas(scope, position, name)
  WHERE active = true;

ALTER TABLE quote_items
  ADD COLUMN area_id UUID REFERENCES quote_areas(id),
  ADD COLUMN area_name_snapshot TEXT,
  ADD COLUMN area_scope_snapshot TEXT CHECK (area_scope_snapshot IS NULL OR area_scope_snapshot IN ('interior', 'exterior'));

CREATE INDEX idx_quote_items_area
  ON quote_items(area_id)
  WHERE area_id IS NOT NULL;

ALTER TABLE quote_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all" ON quote_areas
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
