-- Drop the existing user_content view
DROP VIEW IF EXISTS user_content;

-- Create a new user_content table instead of a view
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

-- Add RLS policies
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own content
CREATE POLICY "Users can view their own content"
  ON public.user_content
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own content
CREATE POLICY "Users can insert their own content"
  ON public.user_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own content
CREATE POLICY "Users can update their own content"
  ON public.user_content
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own content
CREATE POLICY "Users can delete their own content"
  ON public.user_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to populate user_content from blog_comments and reviews
CREATE OR REPLACE FUNCTION sync_user_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear existing entries for this user
  DELETE FROM public.user_content WHERE user_id = NEW.user_id;
  
  -- Insert blog comments
  INSERT INTO public.user_content (user_id, content_type, title, content, metadata, created_at, updated_at)
  SELECT 
    c.user_id,
    'comment',
    p.title,
    c.content,
    jsonb_build_object(
      'post_id', c.post_id,
      'approved', c.approved
    ),
    c.created_at,
    COALESCE(c.updated_at, c.created_at)
  FROM 
    public.blog_comments c
    JOIN public.blog_posts p ON c.post_id = p.id
  WHERE 
    c.user_id = NEW.user_id;
    
  -- Insert reviews
  INSERT INTO public.user_content (user_id, content_type, title, content, metadata, created_at, updated_at)
  SELECT 
    user_id,
    'review',
    'Review: ' || COALESCE(service, 'General'),
    content,
    jsonb_build_object(
      'rating', rating,
      'service', service,
      'approved', approved
    ),
    created_at,
    COALESCE(updated_at, created_at)
  FROM 
    public.reviews
  WHERE 
    user_id = NEW.user_id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to keep user_content in sync
CREATE TRIGGER sync_user_content_on_comment_change
AFTER INSERT OR UPDATE ON public.blog_comments
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION sync_user_content();

CREATE TRIGGER sync_user_content_on_review_change
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION sync_user_content();
