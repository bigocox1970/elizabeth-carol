const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const { getUserFromToken, isAdmin } = require('./utils/auth');

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, postId, postData, commentId, commentData } = JSON.parse(event.body || '{}');

  // Declare token variable at function scope
  let token = null;

  // Only require auth for write operations
  if (['create', 'update', 'delete'].includes(action)) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'No authorization token provided' })
      };
    }

    // Extract the token from the Bearer header
    token = authHeader.replace('Bearer ', '');

    try {
      const userData = await getUserFromToken(token);
      if (!userData) {
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Invalid token' })
        };
      }

      const adminStatus = await isAdmin(userData.id, token);
      if (!adminStatus) {
        return {
          statusCode: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
    } catch (error) {
      console.error('Error verifying admin status:', error);
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Error verifying admin status' })
      };
    }
  }

  console.log('Starting manage-blog function');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
  console.log('Action:', action);
  
  switch (action) {
    case 'get-all':
      try {
        // Return all posts, sorted by date (newest first)
        console.log('Fetching all posts from Supabase');
        console.log('Using URL:', `${SUPABASE_URL}/rest/v1/blog_posts?select=*&order=created_at.desc`);
        
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });

        console.log('All posts response status:', allResponse.status);
        
        if (!allResponse.ok) {
          const errorText = await allResponse.text();
          console.error('All posts response error:', errorText);
          throw new Error(`Database query failed: ${allResponse.status} - ${errorText}`);
        }

        const allPosts = await allResponse.json();
        console.log('Retrieved posts:', JSON.stringify(allPosts, null, 2));
        
        // Format posts for frontend
        const formattedAllPosts = allPosts.map(post => ({
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          category: post.category,
          published: post.published,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: post.author,
          image_url: post.image_url
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            posts: formattedAllPosts,
            source: 'supabase'
          })
        };
      } catch (error) {
        console.error('Error fetching all posts:', error);
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Failed to retrieve posts',
            error: error.message
          })
        };
      }

    case 'get-published':
      try {
        // Return only published posts for public view
        console.log('Fetching published posts from Supabase');
        const publishedResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=*,blog_comments(*)&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });

        console.log('Published response status:', publishedResponse.status);
        
        if (!publishedResponse.ok) {
          const errorText = await publishedResponse.text();
          console.error('Published response error:', errorText);
          throw new Error(`Database query failed: ${publishedResponse.status} - ${errorText}`);
        }

        const publishedPosts = await publishedResponse.json();
        console.log('Retrieved published posts:', JSON.stringify(publishedPosts, null, 2));
        
        // Format posts for frontend
        const formattedPublishedPosts = publishedPosts.map(post => ({
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          category: post.category,
          published: post.published,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: post.author,
          image_url: post.image_url,
          reviews: post.blog_comments.filter(comment => comment.approved).map(comment => ({
            id: comment.id.toString(),
            name: comment.author_name,
            email: comment.author_email,
            comment: comment.content,
            approved: comment.approved,
            createdAt: comment.created_at,
            rating: 5 // Default rating for comments
          }))
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            posts: formattedPublishedPosts,
            source: 'supabase'
          })
        };
      } catch (supabaseError) {
        console.error('Error getting blog posts from Supabase:', supabaseError);
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Failed to retrieve blog posts from database',
            error: supabaseError.message
          })
        };
      }

    case 'get-single':
      try {
        // Get a single post by ID
        console.log('Fetching single post from Supabase');
        console.log('Post ID:', postId);
        console.log('Using URL:', `${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}&select=*,blog_comments(*)`);
        
        const singleResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}&select=*,blog_comments(*)`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });

        console.log('Single post response status:', singleResponse.status);
        
        if (!singleResponse.ok) {
          const errorText = await singleResponse.text();
          console.error('Single post response error:', errorText);
          throw new Error(`Database query failed: ${singleResponse.status} - ${errorText}`);
        }

        const singlePosts = await singleResponse.json();
        console.log('Retrieved single post:', JSON.stringify(singlePosts, null, 2));
        
        if (singlePosts.length === 0) {
          return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Post not found' })
          };
        }
        
        const post = singlePosts[0];
        
        // Format post for frontend
        const formattedPost = {
          id: post.id.toString(),
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          category: post.category,
          published: post.published,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: post.author,
          image_url: post.image_url,
          reviews: post.blog_comments.map(comment => ({
            id: comment.id.toString(),
            name: comment.author_name,
            email: comment.author_email,
            comment: comment.content,
            approved: comment.approved,
            createdAt: comment.created_at,
            rating: 5 // Default rating for comments
          }))
        };

        console.log('Formatted single post:', JSON.stringify(formattedPost, null, 2));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ post: formattedPost })
        };
      } catch (error) {
        console.error('Error getting single post:', error);
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Failed to retrieve post',
            error: error.message
          })
        };
      }

    case 'create':
      // Create a new post
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
          category: postData.category || 'Spiritual Guidance',
          published: postData.published || false,
          author: 'Elizabeth Carol',
          image_url: postData.image_url || null
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create post: ${createResponse.status}`);
      }

      const newPosts = await createResponse.json();
      const newPost = newPosts[0];
      
      // Format post for frontend
      const formattedNewPost = {
        id: newPost.id.toString(),
        title: newPost.title,
        content: newPost.content,
        excerpt: newPost.excerpt,
        category: newPost.category,
        published: newPost.published,
        createdAt: newPost.created_at,
        updatedAt: newPost.updated_at,
        author: newPost.author,
        image_url: newPost.image_url
      };

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ 
          message: 'Post created successfully',
          post: formattedNewPost
        })
      };

    case 'update':
      try {
        console.log('Updating post:', postId);
        console.log('Update data:', JSON.stringify(postData, null, 2));
        
        // Update an existing post
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
            category: postData.category,
            published: postData.published,
            image_url: postData.image_url
          })
        });

        console.log('Update response status:', updateResponse.status);
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Update response error:', errorText);
          throw new Error(`Failed to update post: ${updateResponse.status} - ${errorText}`);
        }

        const updatedPosts = await updateResponse.json();
        console.log('Updated post response:', JSON.stringify(updatedPosts, null, 2));
        
        if (!updatedPosts || updatedPosts.length === 0) {
          throw new Error('No post was returned after update');
        }
        
        const updatedPost = updatedPosts[0];
        
        // Format post for frontend
        const formattedUpdatedPost = {
          id: updatedPost.id.toString(),
          title: updatedPost.title,
          content: updatedPost.content,
          excerpt: updatedPost.excerpt,
          category: updatedPost.category,
          published: updatedPost.published,
          createdAt: updatedPost.created_at,
          updatedAt: updatedPost.updated_at,
          author: updatedPost.author,
          image_url: updatedPost.image_url
        };

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Post updated successfully',
            post: formattedUpdatedPost
          })
        };
      } catch (error) {
        console.error('Error updating post:', error);
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Failed to update post',
            error: error.message
          })
        };
      }

    case 'delete':
      // Delete a post
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete post: ${deleteResponse.status}`);
      }

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Post deleted successfully' })
      };

    default:
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: 'Invalid action' })
      };
  }
};
