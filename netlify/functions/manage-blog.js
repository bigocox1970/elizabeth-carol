const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, postId, postData, commentId, commentData } = JSON.parse(event.body || '{}');

  // Authentication check for write operations
  const isAdmin = password === process.env.ADMIN_PASSWORD;
  if (['create', 'update', 'delete'].includes(action) && !isAdmin) {
    return {
      statusCode: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    console.log('Starting manage-blog function');
    console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
    console.log('Action:', action);
    
    switch (action) {
      case 'get-all':
        // Return all posts, sorted by date (newest first)
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!allResponse.ok) {
          throw new Error(`Database query failed: ${allResponse.status}`);
        }

        const allPosts = await allResponse.json();
        
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
          body: JSON.stringify({ posts: formattedAllPosts })
        };

      case 'get-published':
        try {
          // Return only published posts for public view
          console.log('Fetching published posts from Supabase');
          const publishedResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=*,blog_comments(*)&order=created_at.desc`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        // Get a single post by ID
        const singleResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}&select=*,blog_comments(*)`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!singleResponse.ok) {
          throw new Error(`Database query failed: ${singleResponse.status}`);
        }

        const singlePosts = await singleResponse.json();
        
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

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ post: formattedPost })
        };

      case 'create':
        // Create a new post
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
          reviews: []
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
        // Update an existing post
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
            category: postData.category,
            published: postData.published,
            updated_at: new Date().toISOString()
          })
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update post: ${updateResponse.status}`);
        }

        const updatedPosts = await updateResponse.json();
        
        if (updatedPosts.length === 0) {
          return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Post not found' })
          };
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
          author: updatedPost.author
        };

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Post updated successfully',
            post: formattedUpdatedPost
          })
        };

      case 'delete':
        // Delete a post
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${postId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

  } catch (error) {
    console.error('Error managing blog:', error);
    
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        message: 'Failed to manage blog posts',
        error: error.message
      })
    };
  }
};
