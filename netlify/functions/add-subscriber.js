// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Validate the Supabase URL to prevent "Failed to construct URL" errors
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

// Check if Supabase credentials are valid
const hasValidSupabaseCredentials = SUPABASE_URL && 
                                   SUPABASE_ANON_KEY && 
                                   isValidUrl(SUPABASE_URL);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    console.log('Starting add-subscriber function');
    console.log('Supabase credentials check:', {
      supabaseUrl: SUPABASE_URL ? 'Provided' : 'Missing',
      supabaseKey: SUPABASE_ANON_KEY ? 'Provided' : 'Missing',
      isValidUrl: SUPABASE_URL ? isValidUrl(SUPABASE_URL) : false,
      usingSupabase: hasValidSupabaseCredentials
    });
    
    const { email, name, source = 'newsletter', user_id = null } = JSON.parse(event.body);
    console.log('Parsed request body:', { email, name, source, user_id });
    
    if (!email) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Email is required' 
        })
      };
    }

    // Skip Supabase operations if credentials are invalid
    if (!hasValidSupabaseCredentials) {
      console.log('Invalid Supabase credentials, skipping Supabase operations');
      throw new Error('Invalid Supabase credentials');
    }
    
    // Use a nested try-catch for Supabase operations, similar to contact.js
    try {
      // Check if email already exists
      const checkUrl = `${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=email`;
      console.log('Check URL:', checkUrl);
      
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Check response status:', checkResponse.status);
      
      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error('Check response error:', errorText);
        throw new Error(`Database query failed: ${checkResponse.status} - ${errorText}`);
      }

      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            success: true,
            message: 'You are already subscribed!',
            isNew: false
          })
        };
      }
      
      // Add to subscriber list
      const insertUrl = `${SUPABASE_URL}/rest/v1/subscribers`;
      console.log('Insert URL:', insertUrl);
      
      // Create insert body, only include user_id if it's not null or undefined
      const insertBody = {
        email: email.toLowerCase(),
        name: name || '',
        source: source,
        date_added: new Date().toISOString(),
        active: true
      };
      
      // Only add user_id if it exists
      if (user_id) {
        insertBody.user_id = user_id;
      }
      
      console.log('Insert body:', insertBody);
      
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insertBody)
      });

      console.log('Insert response status:', insertResponse.status);
      
      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Insert response error:', errorText);
        throw new Error(`Failed to add subscriber: ${insertResponse.status} - ${errorText}`);
      }

      console.log('NEW SUBSCRIBER:', email, name, new Date().toISOString());
    } catch (supabaseError) {
      console.error('Failed to add subscriber to Supabase:', supabaseError);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          success: false,
          message: 'Failed to subscribe. Please try again.',
          error: supabaseError.message
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: true,
        message: 'Successfully subscribed!',
        isNew: true
      })
    };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        success: false,
        message: 'Failed to subscribe. Please try again.',
        error: error.message
      })
    };
  }
};
