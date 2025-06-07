-- Enable Supabase Auth
-- This migration adds user_id columns to relevant tables and sets up RLS policies
-- to allow users to manage their own content

-- Add user_id column to blog_comments table
ALTER TABLE public.blog_comments ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to reviews table
ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id column to subscribers table
ALTER TABLE public.subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);

-- Re-enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.subscribers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public read of approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow anonymous read of all comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow anonymous comment inserts" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow anonymous comment updates" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow anonymous comment deletes" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow public read of approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous read of all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous review inserts" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous review updates" ON public.reviews;
DROP POLICY IF EXISTS "Allow anonymous review deletes" ON public.reviews;

-- Create new policies for subscribers
CREATE POLICY "Enable read access for all users" ON public.subscribers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for anyone" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON public.subscribers
    FOR UPDATE USING (auth.uid() = user_id);

-- Create new policies for blog_comments
CREATE POLICY "Enable read access for all users" ON public.blog_comments
    FOR SELECT USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON public.blog_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.blog_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.blog_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create new policies for reviews
CREATE POLICY "Enable read access for all users" ON public.reviews
    FOR SELECT USING (approved = true OR auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view to show users their own content
CREATE OR REPLACE VIEW user_content AS
SELECT 
    'comment' as content_type,
    id,
    post_id,
    content,
    approved,
    created_at,
    user_id
FROM 
    public.blog_comments
UNION ALL
SELECT 
    'review' as content_type,
    id,
    NULL as post_id,
    content,
    approved,
    created_at,
    user_id
FROM 
    public.reviews;

-- Enable RLS on the view
ALTER VIEW user_content OWNER TO postgres;
GRANT SELECT ON user_content TO authenticated;
GRANT SELECT ON user_content TO service_role;
