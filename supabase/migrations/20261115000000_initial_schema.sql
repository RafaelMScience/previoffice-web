-- PreviOffice Initial Database Schema
-- Multi-tenant Law Office Architecture with Row Level Security (RLS)
-- Optimized according to Supabase Postgres Best Practices

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tenants Table (Law Offices)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_name TEXT NOT NULL,
    lead_lawyer_name TEXT NOT NULL,
    oab_number TEXT NOT NULL,
    tax_id TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT NOT NULL UNIQUE,
    address TEXT,
    logo_url TEXT,
    plan_type TEXT NOT NULL DEFAULT 'TRIAL_90_DAYS',
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Profiles (Team Members - Lawyers & Receptionists)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'RECEPTIONIST' CHECK (role IN ('MANAGING_LAWYER', 'ASSOCIATE_LAWYER', 'RECEPTIONIST')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Clients Table (Prospective & Retained Social Security Clients)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Identification
    full_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    cpf TEXT,
    normalized_cpf TEXT,
    rg TEXT,
    birth_date DATE,
    marital_status TEXT,
    profession TEXT,
    nationality TEXT DEFAULT 'Brasileira',
    place_of_birth TEXT,
    mother_name TEXT,
    father_name TEXT,

    -- Address
    postal_code TEXT,
    street TEXT,
    street_number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,

    -- Contacts
    phone TEXT,
    mobile_phone TEXT,
    email TEXT,

    -- Socioeconomic & Benefit
    monthly_income NUMERIC(12,2),
    dependent_count INTEGER DEFAULT 0,
    has_active_benefit BOOLEAN DEFAULT false,
    benefit_type TEXT,
    benefit_number TEXT,
    recent_contributions_summary TEXT,
    special_categories TEXT[],

    -- Security & Media
    encrypted_inss_password TEXT,
    photo_reference TEXT,
    notes TEXT,

    -- Counters
    visit_count INTEGER NOT NULL DEFAULT 1,
    last_visit_at TIMESTAMPTZ,
    last_attendant_name TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'PROSPECT' CHECK (status IN ('PROSPECT', 'PENDING', 'CLOSED', 'INACTIVE')),
    active BOOLEAN NOT NULL DEFAULT true,
    inactivation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. Attendances Table (Visits, Returns & Checklists)
CREATE TABLE public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

    attendance_type TEXT NOT NULL DEFAULT 'OTHER',
    attended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    objective TEXT NOT NULL,
    narrative_history TEXT,
    initial_intake_notes TEXT,
    notes TEXT,
    attendant_name TEXT,
    -- ON DELETE SET NULL ensures deleting a team member never deletes attendance records
    attendant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    pending_documents JSONB,
    physical_file_location TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Documents Metadata Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES public.attendances(id) ON DELETE SET NULL,

    original_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. High-Performance Foreign Key & Search Indexes (Supabase Best Practices)
-- Foreign Keys Indexes
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_clients_tenant_id ON public.clients(tenant_id);
CREATE INDEX idx_attendances_tenant_id ON public.attendances(tenant_id);
CREATE INDEX idx_attendances_client_id ON public.attendances(client_id);
CREATE INDEX idx_attendances_attendant_user_id ON public.attendances(attendant_user_id);
CREATE INDEX idx_documents_tenant_id ON public.documents(tenant_id);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_attendance_id ON public.documents(attendance_id);

-- Search and Lookup Indexes
CREATE INDEX idx_clients_normalized_name ON public.clients(normalized_name);
CREATE INDEX idx_clients_normalized_cpf ON public.clients(normalized_cpf);
CREATE INDEX idx_clients_mobile_phone ON public.clients(mobile_phone);
CREATE INDEX idx_clients_status ON public.clients(status);

-- Partial Indexes for fast active record filtering (soft-delete optimization)
CREATE INDEX idx_clients_active ON public.clients(tenant_id, created_at DESC) WHERE deleted_at IS NULL AND active = true;
CREATE INDEX idx_documents_active ON public.documents(client_id, created_at DESC) WHERE deleted_at IS NULL;

-- 8. Row-Level Security (RLS) Activation (100% of tables)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Security Definer helper with fixed search_path to resolve current user's tenant
-- Checks app_metadata first (tamper-proof), then looks up profiles
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF((SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_id'), '')::uuid,
    (SELECT p.tenant_id FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );
$$;

-- RLS Policies enforcing strict tenant isolation with subquery caching (SELECT public.current_tenant_id())
CREATE POLICY "Tenant Isolation for Tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (id = (SELECT public.current_tenant_id()));

CREATE POLICY "Tenant View Profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.current_tenant_id()));

CREATE POLICY "User Update Own Profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Tenant Isolation for Clients"
ON public.clients FOR ALL
TO authenticated
USING (tenant_id = (SELECT public.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT public.current_tenant_id()));

CREATE POLICY "Tenant Isolation for Attendances"
ON public.attendances FOR ALL
TO authenticated
USING (tenant_id = (SELECT public.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT public.current_tenant_id()));

CREATE POLICY "Tenant Isolation for Documents"
ON public.documents FOR ALL
TO authenticated
USING (tenant_id = (SELECT public.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT public.current_tenant_id()));

-- 9. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tenants_modtime
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_clients_modtime
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_attendances_modtime
BEFORE UPDATE ON public.attendances
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_documents_modtime
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
