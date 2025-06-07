const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Get all subscribers from Supabase using REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?select=*&order=date_added.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Database query failed: ${response.status}`);
    }

    const subscribers = await response.json();

    // Format data for the admin panel (match expected format)
    const formattedSubscribers = subscribers.map(sub => ({
      email: sub.email,
      name: sub.name,
      source: sub.source,
      dateAdded: sub.date_added,
      active: sub.active
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        subscribers: formattedSubscribers
      })
    };

  } catch (error) {
    console.error('Error reading subscribers:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: 'Failed to get subscribers' })
    };
  }
};
