-- Add 'pending' status to bookings table
-- This allows customers to create booking requests that need approval

-- Update the status check constraint to include 'pending'
ALTER TABLE public.bookings 
DROP CONSTRAINT bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending'));

-- Update the comment to reflect the new status
COMMENT ON COLUMN public.bookings.status IS 'Booking status: confirmed, cancelled, completed, or pending';

-- Update the default status to be pending (so customer requests start as pending)
ALTER TABLE public.bookings 
ALTER COLUMN status SET DEFAULT 'pending'; 