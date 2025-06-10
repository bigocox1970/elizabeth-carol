const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  const { action, newsletterData, newsletterId } = JSON.parse(event.body || '{}');

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

  // Verify the user is an admin
  const isAdminResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
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
  if (['create-newsletter', 'update-newsletter', 'delete-newsletter', 'send-newsletter'].includes(action) && !isAdmin) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    switch (action) {
      case 'get-all-newsletters':
        // Return all newsletters, sorted by date (newest first)
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?select=*&order=created_at.desc`, {
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

        const allNewsletters = await allResponse.json();
        
        // Format newsletters for frontend
        const formattedNewsletters = allNewsletters.map(newsletter => ({
          id: newsletter.id.toString(),
          subject: newsletter.subject,
          content: newsletter.content,
          sent: newsletter.sent,
          sentAt: newsletter.sent_at,
          createdAt: newsletter.created_at
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ newsletters: formattedNewsletters })
        };

      case 'create-newsletter':
        // Create a new newsletter
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletters`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            ...newsletterData,
            sent: false,
            sent_at: null
          })
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create newsletter: ${createResponse.status}`);
        }

        const newNewsletter = await createResponse.json();

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Newsletter created successfully',
            newsletter: newNewsletter[0]
          })
        };

      case 'update-newsletter':
        // Update a newsletter
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?id=eq.${newsletterId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newsletterData)
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update newsletter: ${updateResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Newsletter updated successfully' })
        };

      case 'delete-newsletter':
        // Delete a newsletter
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?id=eq.${newsletterId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete newsletter: ${deleteResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Newsletter deleted successfully' })
        };

      case 'send-newsletter':
        // Mark newsletter as sent and update sent_at timestamp
        const sendResponse = await fetch(`${SUPABASE_URL}/rest/v1/newsletters?id=eq.${newsletterId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sent: true,
            sent_at: new Date().toISOString()
          })
        });

        if (!sendResponse.ok) {
          throw new Error(`Failed to mark newsletter as sent: ${sendResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Newsletter marked as sent successfully' })
        };

      default:
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error in manage-newsletter function:', error);
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