-- Drop existing policies if they exist (ignore errors if they don't)
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can select their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Anyone can read approved reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can read their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
    DROP POLICY IF EXISTS "Service role has full access" ON reviews;
EXCEPTION
    WHEN undefined_table THEN
        -- If the table doesn't exist, do nothing
        NULL;
END
$$;

-- Make sure RLS is enabled
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Create new policies (only if the table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        -- Allow anyone to read approved reviews
        CREATE POLICY "Anyone can read approved reviews"
            ON reviews
            FOR SELECT
            USING (approved = true);

        -- Allow authenticated users to read their own reviews (approved or not)
        CREATE POLICY "Users can read their own reviews"
            ON reviews
            FOR SELECT
            USING (auth.uid() = user_id);

        -- Allow authenticated users to update their own reviews
        CREATE POLICY "Users can update their own reviews"
            ON reviews
            FOR UPDATE
            USING (auth.uid() = user_id);

        -- Allow authenticated users to delete their own reviews
        CREATE POLICY "Users can delete their own reviews"
            ON reviews
            FOR DELETE
            USING (auth.uid() = user_id);

        -- Allow authenticated users to insert reviews
        CREATE POLICY "Users can insert reviews"
            ON reviews
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Allow service role to do everything
        CREATE POLICY "Service role has full access"
            ON reviews
            FOR ALL
            USING (auth.role() = 'service_role');
    END IF;
END
$$; 