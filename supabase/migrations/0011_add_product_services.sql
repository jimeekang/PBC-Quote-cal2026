CREATE TABLE IF NOT EXISTS product_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  description TEXT,
  category TEXT,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  unit_cost NUMERIC(10,2) CHECK (unit_cost IS NULL OR unit_cost >= 0),
  bookable BOOLEAN NOT NULL DEFAULT false,
  duration_minutes INT CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  quantity_enabled BOOLEAN NOT NULL DEFAULT false,
  minimum_quantity NUMERIC(10,2) CHECK (minimum_quantity IS NULL OR minimum_quantity >= 0),
  maximum_quantity NUMERIC(10,2) CHECK (maximum_quantity IS NULL OR maximum_quantity >= 0),
  taxable BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, category)
);

CREATE INDEX IF NOT EXISTS idx_product_services_active
  ON product_services(active)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_product_services_search
  ON product_services USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')));

ALTER TABLE product_services ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_services TO authenticated;

DROP POLICY IF EXISTS "authenticated_all" ON product_services;

CREATE POLICY "authenticated_all" ON product_services
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
