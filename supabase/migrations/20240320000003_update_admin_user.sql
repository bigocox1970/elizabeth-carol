-- Find the user ID for info@elizabethcarol.co.uk
SELECT id INTO TEMPORARY TABLE temp_admin_id
FROM auth.users
WHERE email = 'info@elizabethcarol.co.uk';

-- Remove the old admin user
DELETE FROM public.admin_users
WHERE id = 'bc5bbe55-23e1-4aff-b794-a0ecd57c5d84';

-- Add the new admin user
INSERT INTO public.admin_users (id)
SELECT id FROM temp_admin_id
ON CONFLICT (id) DO NOTHING;

-- Verify the admin was added
SELECT 
    au.id,
    u.email,
    u.raw_user_meta_data->>'name' as name,
    au.created_at as admin_since
FROM public.admin_users au
JOIN auth.users u ON u.id = au.id
WHERE u.email = 'info@elizabethcarol.co.uk';

-- Clean up
DROP TABLE temp_admin_id; 