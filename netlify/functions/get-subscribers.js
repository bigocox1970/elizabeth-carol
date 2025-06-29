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
    console.log('Starting get-subscribers function');
    console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
    
    try {
      // Try to get subscribers from Supabase first
      const url = `${SUPABASE_URL}/rest/v1/subscribers?select=*&order=date_added.desc`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Database query failed: ${response.status} - ${errorText}`);
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
          subscribers: formattedSubscribers,
          source: 'supabase'
        })
      };
    } catch (supabaseError) {
      console.error('Error getting subscribers from Supabase:', supabaseError);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ 
          message: 'Failed to retrieve subscribers from database',
          error: supabaseError.message
        })
      };
    }

  } catch (error) {
    console.error('Error reading subscribers:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        message: 'Failed to get subscribers',
        error: error.message
      })
    };
  }
};
