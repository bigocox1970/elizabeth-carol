# Netlify Functions

## Overview
Serverless functions are used for backend logic, including booking, payment, email, and admin actions. All functions are in `netlify/functions/`.

## Key Functions
- `create-paypal-order.js`: Creates PayPal orders for bookings.
- `paypal-webhook.js`: Handles PayPal payment webhooks and updates bookings.
- `send-booking-email.js`: Sends booking confirmation and admin notification emails.
- `manage-availability.js`: (WIP) Manages available booking slots.
- `manage-subscribers.js`: Handles newsletter subscribers.
- `manage-reviews.js`: Handles reviews (add, approve, delete).
- `manage-comments.js`: Handles blog comments.
- `manage-blog.js`: Blog post CRUD and admin actions.
- `generate-blog-post.js`: AI-powered blog post generation.
- `generate-image.js`: AI-powered image generation.
- `verify-admin.js`: Verifies admin status for protected actions.
- `upload-image.js`: Handles image uploads.
- `send-newsletter.js`: Sends newsletters to subscribers.
- `add-subscriber.js`: Adds a new newsletter subscriber.
- `get-subscribers.js`: Gets the list of subscribers.
- `submit-form.js`: Handles contact and other form submissions.
- `utils/auth.js`: Shared auth helpers for backend functions.

## Usage
- Functions are called from the frontend via API calls or triggered by PayPal webhooks.
- All sensitive actions require authentication and, if needed, admin verification.

## See Also
- [paypal.md](./paypal.md) for payment flow
- [booking.md](./booking.md) for booking logic
- [email.md](./email.md) for notifications 