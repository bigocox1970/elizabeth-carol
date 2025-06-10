-- Add the user as an admin
INSERT INTO public.admin_users (id)
VALUES ('bc5bbe55-23e1-4aff-b794-a0ecd57c5d84')
ON CONFLICT (id) DO NOTHING;

-- Verify the admin was added
SELECT 
    au.id,
    u.email,
    u.raw_user_meta_data->>'name' as name,
    au.created_at as admin_since
FROM public.admin_users au
JOIN auth.users u ON u.id = au.id
WHERE au.id = 'bc5bbe55-23e1-4aff-b794-a0ecd57c5d84'; 