-- Create proper RLS policies for reviews table
-- This allows anonymous users to submit reviews and admins to see all reviews

-- Re-enable RLS first
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable full access for service role" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for authenticated admin" ON public.reviews;

-- Allow anyone to insert reviews (for public review submissions)
CREATE POLICY "Allow anonymous review submissions" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Allow reading approved reviews OR if user owns the review
CREATE POLICY "Allow reading reviews" ON public.reviews
    FOR SELECT USING (
        approved = true OR 
        auth.uid() = user_id
    );

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id); 