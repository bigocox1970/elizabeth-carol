-- This query will show all users in the auth.users table
-- Replace 'your-mums-email@example.com' with your mum's email address
SELECT 
    id as user_id,
    email,
    raw_user_meta_data->>'name' as name,
    created_at
FROM auth.users
WHERE email = 'your-mums-email@example.com';

-- After you find the UUID, use it to make the user an admin:
-- INSERT INTO public.admin_users (id)
-- VALUES ('paste-the-uuid-here'); 