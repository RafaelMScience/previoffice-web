-- Migration: Create contracts table and record custom clause edits
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    contract_number TEXT NOT NULL,
    template_id TEXT,
    template_title TEXT,
    benefit_species TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    fee_structure JSONB,
    lawyer_name TEXT NOT NULL,
    lawyer_oab TEXT,
    office_name TEXT NOT NULL,
    physical_signed_status TEXT DEFAULT 'PENDING',
    physical_file_location TEXT,
    is_custom_edited BOOLEAN DEFAULT FALSE,
    custom_edited_by TEXT,
    custom_edited_at TIMESTAMPTZ,
    custom_contract_body TEXT,
    custom_poa_body TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contracts_tenant_contract_number UNIQUE (tenant_id, contract_number)
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contracts' AND policyname = 'contracts_tenant_isolation_policy'
    ) THEN
        CREATE POLICY contracts_tenant_isolation_policy ON public.contracts
            FOR ALL
            USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
            WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON public.contracts(contract_number);
