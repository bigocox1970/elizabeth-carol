# Authentication

## Overview
Authentication is handled using Supabase Auth. The frontend uses a React context (`src/contexts/AuthContext.tsx`) to manage user sessions, login, registration, and logout. Admin verification is performed via a custom RPC and Netlify functions.

## Main Files
- `src/contexts/AuthContext.tsx` — Provides auth state and helpers to the app
- `src/lib/supabase.ts` — Supabase client and auth helpers
- `src/pages/Auth.tsx` — Login/Register page
- `src/components/auth/LoginForm.tsx` — Login form UI/logic
- `src/components/auth/RegisterForm.tsx` — Registration form UI/logic
- `netlify/functions/utils/auth.js` — Used by backend functions to verify tokens and admin status
- `supabase/config.toml` — Auth config (JWT expiry, email templates, etc)

## User Flow
1. User visits `/auth` and chooses to log in or register.
2. On login/register, credentials are sent to Supabase via the context helpers.
3. On success, the session and user are stored in context and localStorage.
4. The app reacts to auth state changes and updates UI accordingly.
5. Admin status is checked via a custom RPC (`is_admin`) and used to gate admin features.

## Admin Verification
- Admin users are stored in a special table and verified via the `is_admin` RPC.
- Netlify functions use the token from the frontend to check admin status before allowing sensitive actions.

## Email Verification
- Email confirmation is required for new users (see `supabase/config.toml`).
- Custom email templates are used for invites, confirmation, recovery, and magic links.

## Security
- JWT tokens are stored securely and refreshed as needed.
- All sensitive backend actions require a valid token and admin check.

## See Also
- [database-schema.md](./database-schema.md) for user/profile tables
- [profiles.md](./profiles.md) for user/admin profile logic 