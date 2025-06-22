# User & Admin Profiles

## Overview
Profiles are managed in the `profiles` table in Supabase. Each user has a profile created automatically on signup. Admins are verified via a special table and RPC.

## Main Files
- `supabase/migrations/20250117100000_create_profiles_table.sql` — Profiles table schema
- `src/pages/UserProfile.tsx` — User profile page (view/edit info, bookings, reviews)
- `src/contexts/AuthContext.tsx` — Provides user info to the app
- `netlify/functions/verify-admin.js` — Checks admin status

## User Profiles
- Created automatically on signup (trigger in Supabase)
- Stores name, email, phone, avatar, etc.
- Users can update their info from the profile page

## Admin Profiles
- Admins are listed in a special table
- Admin status is checked via the `is_admin` RPC and used to gate admin features
- Admins can access extra features in the admin panel

## See Also
- [auth.md](./auth.md) for authentication
- [booking.md](./booking.md) for booking logic 