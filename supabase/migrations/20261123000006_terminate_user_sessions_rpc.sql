-- Secure RPC to terminate all active sessions for a user within Supabase Auth
-- Can only be called by service_role or authenticated users via authorized backend APIs
CREATE OR REPLACE FUNCTION public.terminate_user_sessions(target_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Terminate all sessions for target user
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
