-- Allow anonymous review submissions
-- The current RLS policy only allows authenticated users to submit reviews
-- This fixes the 400 error when trying to submit reviews anonymously

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reviews;

-- Create a new policy that allows both authenticated and anonymous inserts
CREATE POLICY "Enable insert for anyone" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Keep the existing policies for read/update/delete unchanged 