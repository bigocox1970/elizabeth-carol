const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Log the event for debugging
  console.log('PayPal webhook event:', event.body);

  let webhookEvent;
  try {
    webhookEvent = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Only handle payment completed events
  if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const bookingId = webhookEvent.resource?.custom_id;
    if (!bookingId) {
      return { statusCode: 400, body: 'No bookingId in PayPal webhook' };
    }

    // Update booking in Supabase
    // (Replace with your actual Supabase update logic)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        status: 'confirmed',
        payment_status: 'payment_received',
      }),
    });
    const updateData = await updateRes.json();
    console.log('Supabase update result:', updateData);

    return {
      statusCode: 200,
      body: 'Booking confirmed',
    };
  }

  return {
    statusCode: 200,
    body: 'Event ignored',
  };
}; 