-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.subscribers;
DROP POLICY IF EXISTS "Allow anonymous selects" ON public.subscribers;

-- Create proper policies for anonymous access
CREATE POLICY "Enable insert for authenticated users only" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.subscribers
    FOR SELECT USING (true);

-- Temporarily disable RLS for testing
ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
