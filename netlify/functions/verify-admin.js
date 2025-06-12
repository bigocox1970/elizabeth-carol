// This function verifies the admin password without exposing it in the frontend code

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Get the user's JWT token from the Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) {
    console.error('No authorization header provided');
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'No authorization token provided' })
    };
  }

  // Extract the token from the Bearer header
  const token = authHeader.replace('Bearer ', '');
  console.log('Verifying admin status with token:', token.substring(0, 10) + '...');

  try {
    // First, get the user ID from the token
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to get user info:', await userResponse.text());
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

    const userData = await userResponse.json();
    console.log('User data:', userData);

    // Now verify the user is an admin
    const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userData.id })
    });

    console.log('Supabase response status:', isAdminResponse.status);
    const responseText = await isAdminResponse.text();
    console.log('Supabase response body:', responseText);

    if (!isAdminResponse.ok) {
      console.error('Supabase admin check failed:', {
        status: isAdminResponse.status,
        statusText: isAdminResponse.statusText,
        body: responseText
      });
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Unauthorized',
          details: responseText
        })
      };
    }

    let isAdmin;
    try {
      isAdmin = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Supabase response:', e);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Invalid response from Supabase',
          details: responseText
        })
      };
    }

    console.log('Admin check result:', isAdmin);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ isAdmin })
    };
  } catch (error) {
    console.error('Error in verify-admin function:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
