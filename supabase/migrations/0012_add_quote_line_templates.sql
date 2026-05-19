CREATE TABLE IF NOT EXISTS quote_line_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS quote_line_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES quote_line_templates(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('line_item', 'text')),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  description TEXT,
  quantity NUMERIC(10,2) CHECK (quantity IS NULL OR quantity >= 0),
  unit_price NUMERIC(10,2) CHECK (unit_price IS NULL OR unit_price >= 0),
  taxable BOOLEAN NOT NULL DEFAULT true,
  client_visible BOOLEAN NOT NULL DEFAULT true,
  linked_product_or_service_id TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_line_templates_active
  ON quote_line_templates(active, name)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_quote_line_template_items_template
  ON quote_line_template_items(template_id, position);

ALTER TABLE quote_line_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_template_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quote_line_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quote_line_template_items TO authenticated;

DROP POLICY IF EXISTS "authenticated_all" ON quote_line_templates;
DROP POLICY IF EXISTS "authenticated_all" ON quote_line_template_items;

CREATE POLICY "authenticated_all" ON quote_line_templates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_all" ON quote_line_template_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
