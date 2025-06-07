-- Create subscribers table
CREATE TABLE public.subscribers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT DEFAULT 'subscription',
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous access (for the website forms)
CREATE POLICY "Allow anonymous inserts" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON public.subscribers
    FOR SELECT USING (true);

-- Add indexes for better performance
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_date_added ON public.subscribers(date_added DESC); 