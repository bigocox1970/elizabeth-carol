-- Fix bookings table to use proper user relationship
-- Add user_id column and remove redundant user data fields

-- Add user_id column
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Migrate existing data: try to match client_email to user accounts
UPDATE public.bookings 
SET user_id = auth.users.id 
FROM auth.users 
WHERE bookings.client_email = auth.users.email 
AND bookings.user_id IS NULL;

-- Add reading_type column if it doesn't exist (for different types of readings)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reading_type TEXT DEFAULT 'in_person' CHECK (reading_type IN ('in_person', 'video', 'telephone', 'other'));

-- Add user_notes column for customer notes about their booking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Update status enum to include 'pending'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending'));

-- Add index for user_id
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Update RLS policies to allow users to see their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.bookings;
CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Keep admin access policy
DROP POLICY IF EXISTS "Allow admin full access to bookings" ON public.bookings;
CREATE POLICY "Allow admin full access to bookings" ON public.bookings
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON COLUMN public.bookings.user_id IS 'References the user who made the booking';
COMMENT ON COLUMN public.bookings.reading_type IS 'Type of reading: in_person, video, telephone, or other';
COMMENT ON COLUMN public.bookings.user_notes IS 'Notes added by the customer about their booking';

-- Note: We're keeping client_name, client_email, client_phone for backward compatibility
-- and for manual bookings where there might not be a registered user
-- In the future, these can be deprecated once all bookings use user_id 