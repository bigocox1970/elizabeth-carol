-- Migrate existing users from auth.users to profiles table
-- This ensures all existing authenticated users have profiles

-- First, let's insert all existing auth users into profiles table
INSERT INTO public.profiles (id, email, name, created_at)
SELECT 
    id,
    email,
    COALESCE(
        raw_user_meta_data->>'name',
        raw_user_meta_data->>'full_name', 
        email_confirmed_at::text,
        email
    ) as name,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Also migrate any users from reviews table who might not be in auth.users
-- (These would be people who left reviews but never signed up)
-- We'll create profiles for them but without auth.users reference
DO $$
DECLARE
    review_record RECORD;
    new_user_id UUID;
BEGIN
    FOR review_record IN 
        SELECT DISTINCT email, name, created_at 
        FROM public.reviews 
        WHERE email IS NOT NULL 
        AND email NOT IN (SELECT email FROM public.profiles WHERE email IS NOT NULL)
    LOOP
        -- Generate a new UUID for this profile
        new_user_id := gen_random_uuid();
        
        -- Insert the profile (without auth.users reference since they're not registered)
        INSERT INTO public.profiles (id, email, name, created_at)
        VALUES (new_user_id, review_record.email, review_record.name, review_record.created_at)
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Update any profiles that might have missing names
UPDATE public.profiles 
SET name = COALESCE(name, email, 'Unknown User')
WHERE name IS NULL OR name = '';

-- Add a comment to track this migration
COMMENT ON TABLE public.profiles IS 'User profiles - migrated existing users on 2025-01-17';

-- Show summary of migration
DO $$
DECLARE
    total_profiles INTEGER;
    auth_profiles INTEGER;
    review_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    SELECT COUNT(*) INTO auth_profiles FROM public.profiles WHERE id IN (SELECT id FROM auth.users);
    SELECT COUNT(*) INTO review_profiles FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users);
    
    RAISE NOTICE 'Migration complete:';
    RAISE NOTICE '  Total profiles: %', total_profiles;
    RAISE NOTICE '  From auth.users: %', auth_profiles;
    RAISE NOTICE '  From reviews only: %', review_profiles;
END $$; 