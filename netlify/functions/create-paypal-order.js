const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const { bookingId, amount } = JSON.parse(event.body);

  // PayPal sandbox credentials
  const clientId = 'ATsrCeEZ4t5DEWTZr8y7_3yFExZZn-9_IWBTpI8lyFmczNsMYUdy_dLwDBWVbGSW6Grgjd7ZRnPUSAuF';
  const secret = 'EIa61tyc9UDohWdqk1EKRDv45akyiioBhFfNY9E79ywx8y0MTG14VyrnkkaqohutVLs_cA6PA9vAE3EA';

  // Get OAuth token
  const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Create order
  const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            value: amount,
          },
          custom_id: bookingId,
        },
      ],
      application_context: {
        return_url: 'https://elizabethcarol.co.uk/profile',
        cancel_url: 'https://elizabethcarol.co.uk/profile',
      },
    }),
  });
  const orderData = await orderRes.json();

  // Find approval URL
  const approvalUrl = orderData.links?.find(link => link.rel === 'approve')?.href;

  if (!approvalUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create PayPal order', details: orderData }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ approvalUrl, orderId: orderData.id }),
  };
}; 