-- PreviOffice Initial Database Schema
-- Multi-tenant Law Office Architecture with Row Level Security (RLS)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tenants Table (Law Offices)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

    attendance_type TEXT NOT NULL DEFAULT 'OTHER',
    attended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    objective TEXT NOT NULL,
    narrative_history TEXT,
    initial_intake_notes TEXT,
    notes TEXT,
    attendant_name TEXT,
    -- Important: ON DELETE SET NULL ensures deleting a receptionist never deletes client history
    attendant_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    pending_documents JSONB,
    physical_file_location TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Documents Metadata Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. High-Performance Search Indexes
CREATE INDEX idx_clients_tenant_id ON public.clients(tenant_id);
CREATE INDEX idx_clients_normalized_name ON public.clients(normalized_name);
CREATE INDEX idx_clients_normalized_cpf ON public.clients(normalized_cpf);
CREATE INDEX idx_clients_mobile_phone ON public.clients(mobile_phone);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_attendances_client_id ON public.attendances(client_id);
CREATE INDEX idx_attendances_tenant_id ON public.attendances(tenant_id);

-- 8. Row-Level Security (RLS) Activation (100% of tables)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Helper function to extract tenant_id from auth session token
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid;
$$ LANGUAGE SQL STABLE;

-- RLS Policies enforcing strict tenant isolation
CREATE POLICY "Tenant Isolation for Clients"
ON public.clients FOR ALL
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation for Attendances"
ON public.attendances FOR ALL
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation for Documents"
ON public.documents FOR ALL
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation for Profiles"
ON public.profiles FOR ALL
USING (tenant_id = public.current_tenant_id())
WITH CHECK (tenant_id = public.current_tenant_id());
