-- Add reading_type column to bookings table
-- This adds a column with enum-like behavior using CHECK constraint

ALTER TABLE bookings 
ADD COLUMN reading_type VARCHAR(20) 
CHECK (reading_type IN ('in_person', 'video', 'phone', 'other'));

-- Set a default value for existing records
UPDATE bookings SET reading_type = 'in_person' WHERE reading_type IS NULL;

-- Add a comment to describe the column
COMMENT ON COLUMN bookings.reading_type IS 'Type of reading session: in_person, video, phone, or other'; 