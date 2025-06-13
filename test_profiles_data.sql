-- Add some test data to profiles table for testing client search
INSERT INTO public.profiles (id, name, email, phone) VALUES 
(gen_random_uuid(), 'John Smith', 'john.smith@example.com', '07123456789'),
(gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@example.com', '07987654321'),
(gen_random_uuid(), 'Michael Brown', 'michael.brown@example.com', '07555123456'),
(gen_random_uuid(), 'Emma Wilson', 'emma.wilson@example.com', '07444987654'),
(gen_random_uuid(), 'David Jones', 'david.jones@example.com', '07333456789')
ON CONFLICT (id) DO NOTHING;

-- Check what's in the profiles table
SELECT * FROM public.profiles; 