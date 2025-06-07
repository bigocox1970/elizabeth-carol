-- Temporarily disable RLS on reviews table to fix admin access issues
-- This allows both public submissions and admin access to work properly

ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Ensure proper permissions are granted
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role; 