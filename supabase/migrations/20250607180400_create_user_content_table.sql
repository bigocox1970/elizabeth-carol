-- Check if user_content exists as a view and drop it if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_content') THEN
        DROP VIEW user_content;
    END IF;
END
$$;

-- Create user_content table
CREATE TABLE IF NOT EXISTS public.user_content (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_content') THEN
        ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Policy for users to select their own content
CREATE POLICY "Users can view their own content"
  ON user_content
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own content
CREATE POLICY "Users can insert their own content"
  ON user_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own content
CREATE POLICY "Users can update their own content"
  ON user_content
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own content
CREATE POLICY "Users can delete their own content"
  ON user_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add user_id to blog_comments and reviews tables if not already present
ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for blog_comments
CREATE POLICY IF NOT EXISTS "Users can select their own comments"
  ON blog_comments
  FOR SELECT
  USING (auth.uid() = user_id OR approved = true);

CREATE POLICY IF NOT EXISTS "Users can update their own comments"
  ON blog_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own comments"
  ON blog_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for reviews
CREATE POLICY IF NOT EXISTS "Users can select their own reviews"
  ON reviews
  FOR SELECT
  USING (auth.uid() = user_id OR approved = true);

CREATE POLICY IF NOT EXISTS "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);
