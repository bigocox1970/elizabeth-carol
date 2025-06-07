-- Fix admin access to reviews
-- The admin function needs to access all reviews, not just approved ones

-- Create a policy for service role to access all reviews
CREATE POLICY "Enable full access for service role" ON public.reviews
    FOR ALL USING (
        auth.role() = 'service_role' OR 
        auth.role() = 'supabase_admin'
    );

-- Create a policy for authenticated users to access all reviews (admin function)
CREATE POLICY "Enable read access for authenticated admin" ON public.reviews
    FOR SELECT USING (
        auth.role() = 'authenticated' OR
        approved = true OR 
        auth.uid() = user_id
    );

-- Grant service role access to reviews table
GRANT ALL ON public.reviews TO service_role; 