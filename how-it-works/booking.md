# Booking System

## Overview
The booking system allows users to select a date/time, choose a reading type, and create a booking. Bookings are stored in the `bookings` table in Supabase. Payment and confirmation are handled via PayPal and webhooks.

## Main Files
- `src/pages/Book.tsx` — Main booking page and logic
- `src/lib/supabase.ts` — Booking helper functions
- `src/components/admin/AvailabilityManager.tsx` — Admin booking management
- `src/pages/UserProfile.tsx` — User can view/cancel their bookings
- `netlify/functions/paypal-webhook.js` — Handles payment confirmation
- `netlify/functions/create-paypal-order.js` — Creates PayPal orders

## User Flow
1. User selects a slot and reading type on the booking page.
2. Booking is created in Supabase with status `pending`.
3. User is prompted to pay via PayPal (test or live button).
4. On payment, PayPal webhook updates booking to `confirmed` and `payment_received`.
5. User and admin receive email notifications.
6. User can view/cancel bookings in their profile.

## Admin Flow
- Admin can view, edit, and confirm bookings in the admin panel.
- Payment status can be manually updated if needed.

## Database
- Bookings are stored in the `bookings` table (see [database-schema.md](./database-schema.md)).
- Linked to users via `user_id` and to slots via `availability_slot_id`.

## See Also
- [paypal.md](./paypal.md) for payment flow
- [email.md](./email.md) for notifications
- [profiles.md](./profiles.md) for user/admin logic 