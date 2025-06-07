exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const { email, name, source = 'subscription' } = JSON.parse(event.body);

  // Basic validation
  if (!email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Email is required' })
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Invalid email address' })
    };
  }

  try {
    // For now, just log the subscription and return success
    // In production, you'd integrate with an email service or database
    console.log('New subscriber:', {
      email: email.toLowerCase(),
      name: name || '',
      source: source,
      dateAdded: new Date().toISOString(),
      active: true
    });

    // You can integrate with services like:
    // - Mailchimp API
    // - ConvertKit API  
    // - Airtable
    // - Google Sheets API
    // - Send email to Elizabeth directly

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        message: 'Successfully subscribed!',
        isNew: true
      })
    };

  } catch (error) {
    console.error('Error processing subscription:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Failed to process subscription' })
    };
  }
}; 