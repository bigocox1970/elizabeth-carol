-- Add user_notes column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Also add booking_id column to reviews table to link reviews to specific bookings
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id);

-- Update any existing reviews to have a default booking_id (optional)
-- This is just in case there are existing reviews without booking references 