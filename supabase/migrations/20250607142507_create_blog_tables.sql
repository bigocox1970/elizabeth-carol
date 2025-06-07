-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'Spiritual Guidance',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author TEXT DEFAULT 'Elizabeth Carol'
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table (for testimonials)
CREATE TABLE public.reviews (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Allow public read of published posts" ON public.blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Allow anonymous read of all posts" ON public.blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous inserts" ON public.blog_posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous updates" ON public.blog_posts
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous deletes" ON public.blog_posts
    FOR DELETE USING (true);

-- Create policies for blog_comments
CREATE POLICY "Allow public read of approved comments" ON public.blog_comments
    FOR SELECT USING (approved = true);

CREATE POLICY "Allow anonymous read of all comments" ON public.blog_comments
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous comment inserts" ON public.blog_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous comment updates" ON public.blog_comments
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous comment deletes" ON public.blog_comments
    FOR DELETE USING (true);

-- Create policies for reviews
CREATE POLICY "Allow public read of approved reviews" ON public.reviews
    FOR SELECT USING (approved = true);

CREATE POLICY "Allow anonymous read of all reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous review inserts" ON public.reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous review updates" ON public.reviews
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous review deletes" ON public.reviews
    FOR DELETE USING (true);

-- Add indexes for better performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_approved ON public.blog_comments(approved);
CREATE INDEX idx_reviews_approved ON public.reviews(approved);
CREATE INDEX idx_reviews_featured ON public.reviews(featured);
