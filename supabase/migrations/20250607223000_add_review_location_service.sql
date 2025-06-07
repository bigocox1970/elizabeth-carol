-- Add location and service columns to reviews table
ALTER TABLE reviews 
ADD COLUMN location text,
ADD COLUMN service text;

-- Add comment for documentation
COMMENT ON COLUMN reviews.location IS 'User location/area (e.g., Birmingham, UK)';
COMMENT ON COLUMN reviews.service IS 'Type of service reviewed (e.g., One-to-One Reading, Group Reading, etc.)'; 