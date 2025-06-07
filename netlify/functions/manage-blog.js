const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, postId, postData } = JSON.parse(event.body || '{}');

  // Authentication check for write operations
  if (['POST', 'PUT', 'DELETE'].includes(httpMethod) && password !== 'elizabeth2024') {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  const filePath = path.join(process.cwd(), 'data', 'blog-posts.json');

  try {
    // Read existing posts
    let posts = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      posts = JSON.parse(data);
    } catch (err) {
      posts = [];
    }

    switch (action) {
      case 'get-all':
        // Return all posts, sorted by date (newest first)
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            posts: posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          })
        };

      case 'get-published':
        // Return only published posts for public view
        const publishedPosts = posts
          .filter(post => post.published)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return {
          statusCode: 200,
          body: JSON.stringify({ posts: publishedPosts })
        };

      case 'get-single':
        const post = posts.find(p => p.id === postId);
        if (!post) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Post not found' })
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ post })
        };

      case 'create':
        const newPost = {
          id: Date.now().toString(),
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
          category: postData.category || 'Spiritual Guidance',
          published: postData.published || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'Elizabeth Carol',
          reviews: []
        };
        posts.push(newPost);
        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Post created successfully',
            post: newPost
          })
        };

      case 'update':
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Post not found' })
          };
        }
        
        posts[postIndex] = {
          ...posts[postIndex],
          ...postData,
          updatedAt: new Date().toISOString()
        };
        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
        
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Post updated successfully',
            post: posts[postIndex]
          })
        };

      case 'delete':
        const deleteIndex = posts.findIndex(p => p.id === postId);
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Post not found' })
          };
        }
        
        posts.splice(deleteIndex, 1);
        await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
        
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Post deleted successfully' })
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }

  } catch (error) {
    console.error('Error managing blog:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to manage blog posts' })
    };
  }
}; 