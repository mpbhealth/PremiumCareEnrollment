/*
  # promocodes — allow same code string scoped to different products (PDID)

  Drops the table-level UNIQUE on `code` only. Adds a composite uniqueness on
  normalized code + product so admins can insert e.g. `100MPOWER` for PDID 43957
  and a separate row for another scope without collision.

  Lookup in app: ilike + filter rows by product / wildcard (see promoCodeService.ts).
*/

DROP INDEX IF EXISTS idx_promocodes_code;

ALTER TABLE public.promocodes
  DROP CONSTRAINT IF EXISTS promocodes_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS promocodes_lower_code_product_uidx
  ON public.promocodes (lower(btrim(code)), product);

COMMENT ON INDEX promocodes_lower_code_product_uidx IS
  'Same promo display string may exist once per product PDID / scope; not globally unique on code alone.';
