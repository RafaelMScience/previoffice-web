-- Migration: Create audit_logs table with multi-tenant RLS and immutability trigger
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    action_description TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
    user_agent TEXT NOT NULL DEFAULT 'Unknown',
    severity TEXT NOT NULL DEFAULT 'INFO',
    integrity_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created 
ON public.audit_logs (tenant_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'tenant_isolation_policy_select'
  ) THEN
    CREATE POLICY "tenant_isolation_policy_select" ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'tenant_isolation_policy_insert'
  ) THEN
    CREATE POLICY "tenant_isolation_policy_insert" ON public.audit_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
      );
  END IF;
END $$;

-- Immutability enforcement: ensure audit logs cannot be updated or deleted
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_tampering ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_tampering
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_tampering();

-- Grant permissions: authenticated users can only SELECT and INSERT
GRANT SELECT, INSERT ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;
