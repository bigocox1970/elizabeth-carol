const SUPABASE_URL = 'https://itsxxdxyigsyqxkeonqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3h4ZHh5aWdzeXF4a2VvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDQ1NjgsImV4cCI6MjA2NDg4MDU2OH0.YeWzqm0FsIBs8ojIdyMSkprWn1OA4SfFgB2DM3j2ko';

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

  try {
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

    // Check if email already exists using Supabase REST API
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${email.toLowerCase()}&select=email`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkResponse.ok) {
      throw new Error(`Database check failed: ${checkResponse.status}`);
    }

    const existingUsers = await checkResponse.json();
    
    let isNew = true;
    if (existingUsers.length === 0) {
      // Add new subscriber using Supabase REST API
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name || '',
          source: source,
          date_added: new Date().toISOString(),
          active: true
        })
      });

      if (!insertResponse.ok) {
        throw new Error(`Database insert failed: ${insertResponse.status}`);
      }
    } else {
      isNew = false;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ 
        message: isNew ? 'Successfully subscribed!' : 'Already subscribed',
        isNew: isNew
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
      body: JSON.stringify({ 
        message: 'Failed to process subscription',
        error: error.message 
      })
    };
  }
}; 