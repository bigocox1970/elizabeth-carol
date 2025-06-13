import { getUserFromToken, isAdmin } from './utils/auth.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('--- manage-comments function invoked ---');

export const handler = async (event, context) => {
  const { action, commentData, commentId } = JSON.parse(event.body || '{}');

  // Get the user's JWT token from the Authorization header
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  console.log('Authorization header:', authHeader);

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token ? '[REDACTED]' : 'None');
  } else {
    console.log('No valid Authorization header found');
  }

  try {
    // Verify the user is authenticated
    console.log('Verifying token with Supabase...');
    const userData = await getUserFromToken(token);
    if (!userData) {
      console.log('Token verification failed or user not found');
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Invalid token' })
      };
    }
    console.log('User verified:', userData.id);

    // Check if user is admin for admin operations
    console.log('Checking admin status for user:', userData ? userData.id : 'No user');
    const isAdminUser = await isAdmin(userData.id, token);
    if (['approve-comment', 'unapprove-comment', 'delete-comment', 'get-all-comments'].includes(action) && !isAdminUser) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    switch (action) {
      case 'create-comment':
        if (!commentData || !commentData.postId || !commentData.content) {
          return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Missing required comment data' })
          };
        }

        console.log('Creating comment for user:', userData ? userData.id : 'No user');
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            post_id: commentData.postId,
            name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'Anonymous',
            email: userData.email,
            content: commentData.content,
            user_id: userData.id,
            approved: false // Comments start unapproved
          })
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create comment: ${createResponse.status}`);
        }

        const newComment = await createResponse.json();
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Comment submitted successfully',
            comment: newComment[0]
          })
        };

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
          createdAt: comment.created_at,
          userId: comment.user_id
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