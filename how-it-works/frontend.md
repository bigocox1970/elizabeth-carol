# Frontend Structure

## Overview
The frontend is built with React (Vite). It uses React Router for navigation, context providers for auth and theming, and a modular component structure.

## Main Files & Folders
- `src/App.tsx`: Main app entry, sets up providers and routes
- `src/pages/`: All main pages (Book, UserProfile, Admin, Blog, etc)
- `src/components/`: Shared and feature components (auth, admin, UI, etc)
- `src/contexts/`: Auth and theme context providers
- `src/lib/`: Supabase client, email helpers, utilities
- `src/utils/`: API helpers, blog categories, SEO, email templates
- `src/hooks/`: Custom React hooks

## Routing
- Uses `react-router-dom` for client-side routing
- Main routes: `/`, `/about`, `/services`, `/book`, `/profile`, `/admin`, `/auth`, `/blog`, `/contact`, etc.

## State Management
- Auth state via `AuthContext`
- Theme via `ThemeContext`
- Query state via React Query (for some data)

## Booking Flow
- Booking handled in `Book.tsx`, with PayPal integration and email notifications

## Profile & Admin
- User profile in `UserProfile.tsx`
- Admin panel in `Admin.tsx` and `components/admin/`

## See Also
- [booking.md](./booking.md) for booking flow
- [auth.md](./auth.md) for authentication
- [profiles.md](./profiles.md) for user/admin logic 