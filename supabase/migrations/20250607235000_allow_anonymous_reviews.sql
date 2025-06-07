-- Fix review submission for authenticated users only
-- The issue is that the function needs to properly use the user's auth token

-- Restore the correct policy - only authenticated users should submit reviews
DROP POLICY IF EXISTS "Enable insert for anyone" ON public.reviews;

CREATE POLICY "Enable insert for authenticated users" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id); 