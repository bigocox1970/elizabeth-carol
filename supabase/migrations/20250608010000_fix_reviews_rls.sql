-- Drop existing policies for reviews
DROP POLICY IF EXISTS "Users can select their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Create new policies for reviews
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

-- Make sure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY; 