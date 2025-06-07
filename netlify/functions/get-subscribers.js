const SUPABASE_URL = 'https://itsxxdxyigsyqxkeonqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3h4ZHh5aWdzeXF4a2VvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDQ1NjgsImV4cCI6MjA2NDg4MDU2OH0.YeWzqm0FsIBs8ojIdyMSkprWn1OA4SfFgB2DM3j2ko';

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