const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, commentData, commentId, postId, userToken } = JSON.parse(event.body || '{}');

  // Authentication check for admin operations
  const isAdmin = password === process.env.ADMIN_PASSWORD;

  try {
    console.log('Starting manage-comments function');
    console.log('Action:', action);
    
    switch (action) {
      case 'add-comment':
        // Add a comment to a specific blog post
        if (!commentData.name || !commentData.comment || !postId) {
          return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Name, comment, and post ID are required' })
          };
        }

        // Check if post exists
        const postCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}&select=id`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!postCheckResponse.ok) {
          throw new Error(`Database query failed: ${postCheckResponse.status}`);
        }

        const existingPosts = await postCheckResponse.json();
        
        if (existingPosts.length === 0) {
          return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Blog post not found' })
          };
        }

        // Add comment to blog_comments table
        // Use service role key to bypass RLS for comment insertion
        const commentAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const addCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments`, {
          method: 'POST',
          headers: {
            'apikey': commentAuthKey,
            'Authorization': `Bearer ${commentAuthKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            post_id: postId,
            author_name: commentData.name,
            author_email: commentData.email || '',
            content: commentData.comment,
            user_id: commentData.userId || null,
            approved: false // Requires admin approval
          })
        });

        if (!addCommentResponse.ok) {
          throw new Error(`Failed to add comment: ${addCommentResponse.status}`);
        }

        const newComments = await addCommentResponse.json();
        const newComment = newComments[0];

        // Format comment for frontend
        const formattedNewComment = {
          id: newComment.id.toString(),
          name: newComment.author_name,
          email: newComment.author_email,
          comment: newComment.content,
          approved: newComment.approved,
          createdAt: newComment.created_at
        };

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Thank you for your comment! It will be published after approval.',
            comment: formattedNewComment
          })
        };

      case 'get-comments':
        // Get all blog comments for admin
        console.log('get-comments: Starting');
        if (!isAdmin) {
          console.log('get-comments: Not admin');
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        console.log('get-comments: Fetching comments');
        const getCommentsAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        console.log('get-comments: Using service role key:', !!SUPABASE_SERVICE_ROLE_KEY);
        
        // Get blog comments
        const commentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': getCommentsAuthKey,
            'Authorization': `Bearer ${getCommentsAuthKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('get-comments: Response status:', commentsResponse.status);

        if (!commentsResponse.ok) {
          const errorText = await commentsResponse.text();
          console.error('get-comments: Error response:', errorText);
          throw new Error(`Database query failed: ${commentsResponse.status} - ${errorText}`);
        }

        const comments = await commentsResponse.json();
        console.log('get-comments: Found comments:', comments.length);
        
        // Get posts separately to get titles
        const postsResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=id,title`, {
          method: 'GET',
          headers: {
            'apikey': getCommentsAuthKey,
            'Authorization': `Bearer ${getCommentsAuthKey}`,
            'Content-Type': 'application/json'
          }
        });

        const posts = postsResponse.ok ? await postsResponse.json() : [];
        const postsMap = posts.reduce((acc, post) => {
          acc[post.id] = post.title;
          return acc;
        }, {});
        
        // Format comments for frontend
        const formattedComments = comments.map(comment => ({
          id: comment.id.toString(),
          name: comment.author_name,
          email: comment.author_email,
          content: comment.content,
          postId: comment.post_id?.toString() || 'unknown',
          postTitle: postsMap[comment.post_id] || 'Unknown Post',
          approved: comment.approved,
          createdAt: comment.created_at
        }));

        console.log('get-comments: Returning formatted comments:', formattedComments.length);
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ comments: formattedComments })
        };

      case 'update-comment':
        // Update a blog comment (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const updateCommentAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const updateCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${commentId}`, {
          method: 'PATCH',
          headers: {
            'apikey': updateCommentAuthKey,
            'Authorization': `Bearer ${updateCommentAuthKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentData)
        });

        if (!updateCommentResponse.ok) {
          throw new Error(`Failed to update comment: ${updateCommentResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Comment updated successfully' })
        };

      case 'delete-comment':
        // Delete a blog comment (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const deleteCommentAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const deleteCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${commentId}`, {
          method: 'DELETE',
          headers: {
            'apikey': deleteCommentAuthKey,
            'Authorization': `Bearer ${deleteCommentAuthKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteCommentResponse.ok) {
          throw new Error(`Failed to delete comment: ${deleteCommentResponse.status}`);
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
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 