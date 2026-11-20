-- Grant UPDATE permission on last_login_at for authenticated users
GRANT UPDATE (last_login_at) ON public.profiles TO authenticated;
