-- Check if location and service columns exist in reviews table and add them if they don't
DO $$
BEGIN
    -- Check if location column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'location'
    ) THEN
        -- Add location column
        ALTER TABLE public.reviews ADD COLUMN location text;
        COMMENT ON COLUMN public.reviews.location IS 'User location/area (e.g., Birmingham, UK)';
    END IF;

    -- Check if service column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'service'
    ) THEN
        -- Add service column
        ALTER TABLE public.reviews ADD COLUMN service text;
        COMMENT ON COLUMN public.reviews.service IS 'Type of service reviewed (e.g., One-to-One Reading, Group Reading, etc.)';
    END IF;
END
$$;
