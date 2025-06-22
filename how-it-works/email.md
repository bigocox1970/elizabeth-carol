# Email & Notifications

## Overview
Email is used for booking confirmations, admin notifications, password resets, and newsletters. Both frontend and backend trigger emails.

## Main Files
- `netlify/functions/send-booking-email.js`: Sends booking confirmation and admin notification emails
- `netlify/functions/send-newsletter.js`: Sends newsletters
- `src/lib/emailService.ts`: Frontend email helpers
- `supabase/email-templates/`: Custom email templates for auth
- `supabase/config.toml`: Email template config

## Booking Emails
- Sent to user and admin when a booking is created or updated
- Triggered from both frontend and backend

## Newsletter
- Users can subscribe via the frontend
- Admin can send newsletters via the admin panel

## Auth Emails
- Signup, confirmation, password reset, and magic link emails use custom templates

## See Also
- [booking.md](./booking.md) for booking flow
- [auth.md](./auth.md) for authentication 