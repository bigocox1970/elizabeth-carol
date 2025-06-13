-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin full access to availability_slots" ON public.availability_slots;
DROP POLICY IF EXISTS "Allow admin full access to bookings" ON public.bookings;

-- Create more permissive policies for now (we can restrict later)
CREATE POLICY "Allow all access to availability_slots" ON public.availability_slots
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to bookings" ON public.bookings
    FOR ALL USING (true) WITH CHECK (true); 