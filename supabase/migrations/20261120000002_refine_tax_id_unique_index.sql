-- Migration: Refine tax_id unique index to avoid collisions on non-digit placeholders or empty strings
DROP INDEX IF EXISTS idx_tenants_unique_tax_id_digits;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_unique_tax_id_digits
ON public.tenants (REGEXP_REPLACE(tax_id, '\D', '', 'g'))
WHERE tax_id IS NOT NULL AND REGEXP_REPLACE(tax_id, '\D', '', 'g') <> '';
