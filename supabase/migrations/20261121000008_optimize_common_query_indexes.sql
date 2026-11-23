-- Migration: Optimize Common Query Indexes (Item 17)
-- Targets high-frequency queries in Clients, Attendances, Documents, Contracts, and Profiles
-- Eliminates sequential table scans, accelerates multi-tenant joins, and speeds up ordering/filtering.

-- 1. Enable pg_trgm for fast text search (trigram matching for client names and search bars)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- 2. CLIENTS TABLE INDEXES
-- ==============================================================================

-- A. Tenant-scoped status filtering with ordering (Reception & Client listings)
-- Query: SELECT * FROM clients WHERE tenant_id = $1 AND status = $2 AND deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_clients_tenant_status_created 
ON public.clients (tenant_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- B. Substring search index for client names (Accelerates autocomplete and instant search)
-- Query: SELECT * FROM clients WHERE tenant_id = $1 AND normalized_name ILIKE '%termo%'
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm 
ON public.clients USING gin (normalized_name gin_trgm_ops);

-- C. Composite index for CPF lookups with tenant isolation
-- Query: SELECT * FROM clients WHERE tenant_id = $1 AND normalized_cpf = $2
CREATE INDEX IF NOT EXISTS idx_clients_tenant_cpf 
ON public.clients (tenant_id, normalized_cpf)
WHERE deleted_at IS NULL;

-- D. Tenant-scoped ordering by last visit
-- Query: SELECT * FROM clients WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY last_visit_at DESC NULLS LAST
CREATE INDEX IF NOT EXISTS idx_clients_tenant_last_visit 
ON public.clients (tenant_id, last_visit_at DESC NULLS LAST)
WHERE deleted_at IS NULL;


-- ==============================================================================
-- 3. ATTENDANCES TABLE INDEXES
-- ==============================================================================

-- A. Attendance history by client with chronological sorting (Eliminates filesort)
-- Query: SELECT * FROM attendances WHERE tenant_id = $1 AND client_id = $2 ORDER BY attended_at DESC
CREATE INDEX IF NOT EXISTS idx_attendances_tenant_client_attended 
ON public.attendances (tenant_id, client_id, attended_at DESC);

-- B. Attendance workload by lawyer / attendant user
-- Query: SELECT * FROM attendances WHERE tenant_id = $1 AND attendant_user_id = $2 ORDER BY attended_at DESC
CREATE INDEX IF NOT EXISTS idx_attendances_tenant_attendant_attended 
ON public.attendances (tenant_id, attendant_user_id, attended_at DESC)
WHERE attendant_user_id IS NOT NULL;


-- ==============================================================================
-- 4. DOCUMENTS TABLE INDEXES
-- ==============================================================================

-- A. Client document vault listing sorted chronologically
-- Query: SELECT * FROM documents WHERE tenant_id = $1 AND client_id = $2 AND deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_documents_tenant_client_created 
ON public.documents (tenant_id, client_id, created_at DESC)
WHERE deleted_at IS NULL;

-- B. Client documents filtered by category
-- Query: SELECT * FROM documents WHERE tenant_id = $1 AND client_id = $2 AND category = $3 AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_documents_tenant_client_category 
ON public.documents (tenant_id, client_id, category)
WHERE deleted_at IS NULL;


-- ==============================================================================
-- 5. CONTRACTS TABLE INDEXES
-- ==============================================================================

-- A. Office contract dashboard query ordered by issue/creation date
-- Query: SELECT * FROM contracts WHERE tenant_id = $1 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_created 
ON public.contracts (tenant_id, created_at DESC);

-- B. Contracts by client
-- Query: SELECT * FROM contracts WHERE tenant_id = $1 AND client_id = $2 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_client_created 
ON public.contracts (tenant_id, client_id, created_at DESC);

-- C. Contract status filtering (ACTIVE, DRAFT, TERMINATED)
-- Query: SELECT * FROM contracts WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_status_created 
ON public.contracts (tenant_id, status, created_at DESC);


-- ==============================================================================
-- 6. PROFILES TABLE INDEXES
-- ==============================================================================

-- A. Active team members by role within an office
-- Query: SELECT * FROM profiles WHERE tenant_id = $1 AND role = $2 AND is_active = true
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role_active 
ON public.profiles (tenant_id, role)
WHERE is_active = true;

-- B. Lawyer OAB lookup index
-- Query: SELECT * FROM profiles WHERE oab_number = $1
CREATE INDEX IF NOT EXISTS idx_profiles_oab_lookup 
ON public.profiles (oab_number)
WHERE oab_number IS NOT NULL;
