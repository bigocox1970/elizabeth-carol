-- Fix issue with multiple reviews from the same user
-- The problem is likely with the RLS policy that restricts users to only insert reviews where user_id = auth.uid()

-- Apply the fix directly using SQL
DO $$
BEGIN
    -- Check if the policy exists and drop it
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'reviews' 
        AND policyname = 'Enable insert for authenticated users'
    ) THEN
        DROP POLICY "Enable insert for authenticated users" ON public.reviews;
    END IF;

    -- Create a new policy that allows authenticated users to insert reviews
    -- This policy ensures that the user_id column matches the authenticated user's ID
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        CREATE POLICY "Enable insert for authenticated users" ON public.reviews
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND 
                auth.uid() = user_id
            );
    END IF;
END
$$;

-- Add a comment to explain the policy
COMMENT ON POLICY "Enable insert for authenticated users" ON public.reviews IS 
    'Allows authenticated users to submit reviews with their user_id';
