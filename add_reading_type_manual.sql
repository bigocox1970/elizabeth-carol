-- Simple script to add reading_type column to bookings table
-- Run this manually in your Supabase SQL editor

-- Check if column already exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'reading_type'
    ) THEN
        -- Add the column
        ALTER TABLE bookings 
        ADD COLUMN reading_type VARCHAR(20) 
        CHECK (reading_type IN ('in_person', 'video', 'telephone', 'other'));
        
        -- Set default for existing records
        UPDATE bookings SET reading_type = 'in_person' WHERE reading_type IS NULL;
        
        RAISE NOTICE 'reading_type column added successfully';
    ELSE
        RAISE NOTICE 'reading_type column already exists';
    END IF;
END $$; 