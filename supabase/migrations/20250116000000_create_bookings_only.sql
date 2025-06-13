-- Create availability_slots table for storing Elizabeth's available time slots
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'both' CHECK (service_type IN ('both', 'in_person', 'remote')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table for tracking which slots are booked
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGSERIAL PRIMARY KEY,
    availability_slot_id BIGINT NOT NULL REFERENCES public.availability_slots(id) ON DELETE CASCADE,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    booking_type TEXT DEFAULT 'manual' CHECK (booking_type IN ('manual', 'online')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for availability_slots (admin only for now) - only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_slots' AND policyname = 'Allow admin full access to availability_slots') THEN
        CREATE POLICY "Allow admin full access to availability_slots" ON public.availability_slots
            FOR ALL USING (true);
    END IF;
END $$;

-- Create policies for bookings (admin only for now) - only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Allow admin full access to bookings') THEN
        CREATE POLICY "Allow admin full access to bookings" ON public.bookings
            FOR ALL USING (true);
    END IF;
END $$;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON public.availability_slots(date);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date_time ON public.availability_slots(date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(availability_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Add comments for documentation
COMMENT ON TABLE public.availability_slots IS 'Stores Elizabeth''s available time slots for bookings';
COMMENT ON TABLE public.bookings IS 'Tracks which availability slots are booked by clients';
COMMENT ON COLUMN public.availability_slots.service_type IS 'Type of service: both, in_person, or remote';
COMMENT ON COLUMN public.bookings.booking_type IS 'How the booking was made: manual (by Elizabeth) or online (by customer)';
COMMENT ON COLUMN public.bookings.status IS 'Booking status: confirmed, cancelled, or completed'; 