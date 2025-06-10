const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  const { action, commentData, commentId } = JSON.parse(event.body || '{}');

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
    if (['approve-comment', 'unapprove-comment', 'delete-comment'].includes(action) && !isAdmin) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    switch (action) {
      case 'get-all-comments':
        // Return all comments with post titles, sorted by date (newest first)
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/comments?select=*,blog_posts(title)&order=created_at.desc`, {
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

        const allComments = await allResponse.json();
        
        // Format comments for frontend
        const formattedComments = allComments.map(comment => ({
          id: comment.id.toString(),
          postId: comment.post_id,
          postTitle: comment.blog_posts?.title || 'Unknown Post',
          name: comment.name,
          email: comment.email,
          content: comment.content,
          approved: comment.approved,
          createdAt: comment.created_at
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ comments: formattedComments })
        };

      case 'approve-comment':
      case 'unapprove-comment':
        // Update comment approval status
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${commentId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approved: action === 'approve-comment'
          })
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update comment: ${updateResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Comment updated successfully' })
        };

      case 'delete-comment':
        // Delete a comment
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/comments?id=eq.${commentId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete comment: ${deleteResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Comment deleted successfully' })
        };

      default:
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error in manage-comments function:', error);
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