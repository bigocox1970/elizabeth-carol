const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  const { action, subscriberData, subscriberId } = JSON.parse(event.body || '{}');

  // Get the user's JWT token from the Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'No authorization token provided' })
    };
  }

  // Extract the token from the Bearer header
  const token = authHeader.replace('Bearer ', '');

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
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }

    const userData = await userResponse.json();
    console.log('User data:', userData);

    // Verify the user is an admin
    const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userData.id })
    });

    if (!isAdminResponse.ok) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const isAdmin = await isAdminResponse.json();

    // Authentication check for write operations
    if (['add-subscriber', 'update-subscriber', 'delete-subscriber'].includes(action) && !isAdmin) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    switch (action) {
      case 'get-all-subscribers':
        // Return all subscribers, sorted by date (newest first)
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?select=*&order=date_added.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!allResponse.ok) {
          throw new Error(`Database query failed: ${allResponse.status}`);
        }

        const allSubscribers = await allResponse.json();
        
        // Format subscribers for frontend to match expected format
        const formattedSubscribers = allSubscribers.map(subscriber => ({
          id: subscriber.id.toString(),
          email: subscriber.email,
          name: subscriber.name,
          source: subscriber.source,
          dateAdded: subscriber.date_added,
          active: subscriber.active
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ subscribers: formattedSubscribers })
        };

      case 'add-subscriber':
        // Add a new subscriber
        const addResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(subscriberData)
        });

        if (!addResponse.ok) {
          throw new Error(`Failed to add subscriber: ${addResponse.status}`);
        }

        const newSubscriber = await addResponse.json();

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Subscriber added successfully',
            subscriber: newSubscriber[0]
          })
        };

      case 'update-subscriber':
        // Update a subscriber
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?id=eq.${subscriberId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscriberData)
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update subscriber: ${updateResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Subscriber updated successfully' })
        };

      case 'delete-subscriber':
        // Delete a subscriber
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?id=eq.${subscriberId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete subscriber: ${deleteResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Subscriber deleted successfully' })
        };

      default:
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error in manage-subscribers function:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
}; 