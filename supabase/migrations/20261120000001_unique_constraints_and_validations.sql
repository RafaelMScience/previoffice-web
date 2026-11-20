-- Migration: Enforce strict uniqueness for emails, tax IDs, and client CPFs

-- 1. Profiles Email Uniqueness (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_email_lower
ON public.profiles (LOWER(email));

-- 2. Tenants Email Uniqueness (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_unique_email_lower
ON public.tenants (LOWER(email));

-- 3. Tenants CNPJ/CPF Uniqueness (normalized digits only)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_unique_tax_id_digits
ON public.tenants (REGEXP_REPLACE(tax_id, '\D', '', 'g'))
WHERE tax_id IS NOT NULL AND tax_id <> '';

-- 4. Clients CPF Uniqueness per Tenant (prevents duplicate clients within the same law office)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique_cpf_per_tenant
ON public.clients (tenant_id, normalized_cpf)
WHERE normalized_cpf IS NOT NULL AND normalized_cpf <> '' AND deleted_at IS NULL;
