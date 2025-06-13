import { getUserFromToken, isAdmin } from './utils/auth.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('--- manage-comments function invoked ---');

export const handler = async (event, context) => {
  try {
    console.log('--- manage-comments function invoked ---');
    console.log('Event body:', event.body);
    
    const { action, commentData, commentId } = JSON.parse(event.body || '{}');
    console.log('Parsed request:', { action, commentId, commentData: commentData ? '[REDACTED]' : null });

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
          body: JSON.stringify({ message: 'Invalid or expired token' })
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
          const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              post_id: parseInt(commentData.postId, 10),
              content: commentData.content,
              author_name: userData.user_metadata?.name || userData.email?.split('@')[0] || 'Anonymous',
              author_email: userData.email,
              user_id: userData.id,
              approved: false
            })
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('Comment creation error details:', errorText);
            throw new Error(`Failed to create comment: ${createResponse.status} - ${errorText}`);
          }

          const newComment = await createResponse.json();
          console.log('Comment created successfully:', newComment);

          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              message: 'Comment submitted successfully and awaiting approval',
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
          if (!commentId) {
            return {
              statusCode: 400,
              headers: { "Access-Control-Allow-Origin": "*" },
              body: JSON.stringify({ message: 'Comment ID is required' })
            };
          }

          console.log('Approving comment:', commentId);
          const approveResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${commentId}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              approved: true
            })
          });

          if (!approveResponse.ok) {
            const errorText = await approveResponse.text();
            console.error('Comment approval error details:', errorText);
            throw new Error(`Failed to approve comment: ${approveResponse.status} - ${errorText}`);
          }

          const approvedComment = await approveResponse.json();
          console.log('Comment approved successfully:', approvedComment);

          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              message: 'Comment approved successfully',
              comment: approvedComment[0]
            })
          };

        case 'unapprove-comment':
          if (!commentId) {
            return {
              statusCode: 400,
              headers: { "Access-Control-Allow-Origin": "*" },
              body: JSON.stringify({ message: 'Comment ID is required' })
            };
          }

          console.log('Unapproving comment:', commentId);
          const unapproveResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${commentId}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              approved: false
            })
          });

          if (!unapproveResponse.ok) {
            const errorText = await unapproveResponse.text();
            console.error('Comment unapproval error details:', errorText);
            throw new Error(`Failed to unapprove comment: ${unapproveResponse.status} - ${errorText}`);
          }

          const unapprovedComment = await unapproveResponse.json();
          console.log('Comment unapproved successfully:', unapprovedComment);

          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              message: 'Comment unapproved successfully',
              comment: unapprovedComment[0]
            })
          };

        case 'delete-comment':
          if (!commentId) {
            return {
              statusCode: 400,
              headers: { "Access-Control-Allow-Origin": "*" },
              body: JSON.stringify({ message: 'Comment ID is required' })
            };
          }

          console.log('Deleting comment:', commentId);
          const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${commentId}`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error('Comment deletion error details:', errorText);
            throw new Error(`Failed to delete comment: ${deleteResponse.status} - ${errorText}`);
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
      console.error('Error in manage-comments:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          message: 'Internal server error',
          error: error.message
        })
      };
    }
  } catch (outerError) {
    console.error('Outer error in manage-comments:', outerError);
    console.error('Outer error stack:', outerError.stack);
    console.error('Outer error details:', {
      name: outerError.name,
      message: outerError.message,
      code: outerError.code
    });
    
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: outerError.message
      })
    };
  }
}; 