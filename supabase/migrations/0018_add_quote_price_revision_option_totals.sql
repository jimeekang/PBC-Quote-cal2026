ALTER TABLE quote_price_revisions
  ADD COLUMN IF NOT EXISTS previous_options_subtotal NUMERIC(10,2)
    CHECK (previous_options_subtotal IS NULL OR previous_options_subtotal >= 0),
  ADD COLUMN IF NOT EXISTS new_options_subtotal NUMERIC(10,2)
    CHECK (new_options_subtotal IS NULL OR new_options_subtotal >= 0),
  ADD COLUMN IF NOT EXISTS previous_options_final_total NUMERIC(10,2)
    CHECK (previous_options_final_total IS NULL OR previous_options_final_total >= 0),
  ADD COLUMN IF NOT EXISTS new_options_final_total NUMERIC(10,2)
    CHECK (new_options_final_total IS NULL OR new_options_final_total >= 0);

NOTIFY pgrst, 'reload schema';
