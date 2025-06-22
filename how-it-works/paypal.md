# PayPal Integration

## Overview
PayPal is used to handle payments for bookings. The integration uses the PayPal REST API for order creation and webhooks for payment confirmation.

## Main Files
- `netlify/functions/create-paypal-order.js` — Creates PayPal orders with booking ID as `custom_id`
- `netlify/functions/paypal-webhook.js` — Handles PayPal webhooks and updates bookings
- `src/pages/Book.tsx` — Initiates payment flow from the frontend

## Payment Flow
1. User creates a booking (status: `pending`).
2. Frontend calls `create-paypal-order.js` to create a PayPal order, passing the booking ID and amount.
3. User is redirected to PayPal to pay.
4. After payment, PayPal sends a webhook to `paypal-webhook.js`.
5. The webhook extracts the `custom_id` (booking ID) and updates the booking in Supabase to `confirmed` and `payment_received`.
6. User and admin are notified by email.

## Webhook Setup
- The webhook URL must be set in the PayPal developer dashboard to point to the deployed Netlify function.
- Only `PAYMENT.CAPTURE.COMPLETED` events are processed.

## Security
- Bookings are only confirmed if the webhook is received and the payment is successful.
- Booking IDs are used to match payments to bookings, ensuring accuracy.

## See Also
- [booking.md](./booking.md) for booking flow
- [functions.md](./functions.md) for Netlify backend logic 