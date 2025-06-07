const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, reviewData, reviewId, postId, userToken } = JSON.parse(event.body || '{}');

  // Authentication check for admin operations
  const isAdmin = password === process.env.ADMIN_PASSWORD;

  try {
    console.log('Starting manage-reviews function');
    console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Exists' : 'Missing');
    console.log('Action:', action);
    
    switch (action) {
      case 'add-general-review':
        // Add a general service review
        if (!reviewData.name || !reviewData.rating || !reviewData.comment) {
          return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Name, rating, and comment are required' })
          };
        }

        // Add to reviews table - require authentication
        if (!userToken || !reviewData.userId) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'You must be logged in to submit a review' })
          };
        }

        const addReviewResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: reviewData.name,
            email: reviewData.email || '',
            location: reviewData.location || '',
            service: reviewData.service || 'General',
            rating: parseInt(reviewData.rating),
            title: reviewData.title || '',
            content: reviewData.comment,
            user_id: reviewData.userId,
            approved: false // Requires admin approval
          })
        });

        if (!addReviewResponse.ok) {
          throw new Error(`Failed to add review: ${addReviewResponse.status}`);
        }

        const newReviews = await addReviewResponse.json();
        const newReview = newReviews[0];

        // Format review for frontend
        const formattedNewReview = {
          id: newReview.id.toString(),
          name: newReview.name,
          email: newReview.email,
          location: newReview.location,
          service: newReview.service,
          rating: newReview.rating,
          comment: newReview.content,
          approved: newReview.approved,
          createdAt: newReview.created_at
        };

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Thank you for your review! It will be published after approval.',
            review: formattedNewReview
          })
        };

      case 'add-blog-review':
        // Add a comment to a specific blog post
        if (!reviewData.name || !reviewData.comment || !postId) {
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
        const addCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            post_id: postId,
            author_name: reviewData.name,
            author_email: reviewData.email || '',
            content: reviewData.comment,
            user_id: reviewData.userId || null,
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
          createdAt: newComment.created_at,
          rating: reviewData.rating || 5 // Include rating if provided
        };

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ 
            message: 'Thank you for your comment! It will be published after approval.',
            review: formattedNewComment
          })
        };

      case 'get-all-reviews':
        // Get all reviews for admin
        console.log('get-all-reviews: isAdmin check', isAdmin);
        console.log('get-all-reviews: password provided', !!password);
        console.log('get-all-reviews: admin password env', !!process.env.ADMIN_PASSWORD);
        
        if (!isAdmin) {
          console.log('get-all-reviews: Authentication failed');
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        console.log('get-all-reviews: Fetching reviews from Supabase');
        // Use service role key for admin operations to bypass RLS
        const authKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        console.log('get-all-reviews: Using service role key:', !!SUPABASE_SERVICE_ROLE_KEY);
        
        const allReviewsResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': authKey,
            'Authorization': `Bearer ${authKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('get-all-reviews: Response status', allReviewsResponse.status);

        if (!allReviewsResponse.ok) {
          const errorText = await allReviewsResponse.text();
          console.error('get-all-reviews: Response error', errorText);
          throw new Error(`Database query failed: ${allReviewsResponse.status} - ${errorText}`);
        }

        const allReviews = await allReviewsResponse.json();
        console.log('get-all-reviews: Found', allReviews.length, 'reviews');

        // Format reviews for frontend
        const formattedAllReviews = allReviews.map(review => ({
          id: review.id.toString(),
          name: review.name,
          email: review.email,
          location: review.location,
          service: review.service,
          rating: review.rating,
          title: review.title,
          comment: review.content,
          approved: review.approved,
          featured: review.featured,
          createdAt: review.created_at
        }));

        console.log('get-all-reviews: Returning', formattedAllReviews.length, 'formatted reviews');
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ reviews: formattedAllReviews })
        };

      case 'get-approved-reviews':
        try {
          // Get approved reviews for public display
          console.log('Fetching approved reviews from Supabase');
          const approvedReviewsResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?approved=eq.true&select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Approved reviews response status:', approvedReviewsResponse.status);
          
          if (!approvedReviewsResponse.ok) {
            const errorText = await approvedReviewsResponse.text();
            console.error('Approved reviews response error:', errorText);
            throw new Error(`Database query failed: ${approvedReviewsResponse.status} - ${errorText}`);
          }

          const approvedReviews = await approvedReviewsResponse.json();

          // Format reviews for frontend
          const formattedApprovedReviews = approvedReviews.map(review => ({
            id: review.id.toString(),
            name: review.name,
            email: review.email,
            location: review.location,
            service: review.service,
            rating: review.rating,
            title: review.title,
            comment: review.content,
            approved: review.approved,
            featured: review.featured,
            createdAt: review.created_at
          }));

          return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              reviews: formattedApprovedReviews,
              source: 'supabase'
            })
          };
        } catch (supabaseError) {
          console.error('Error getting approved reviews from Supabase:', supabaseError);
          return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
              message: 'Failed to retrieve reviews from database',
              error: supabaseError.message
            })
          };
        }

      case 'approve-review':
        // Approve a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const approveAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const approveResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'PATCH',
          headers: {
            'apikey': approveAuthKey,
            'Authorization': `Bearer ${approveAuthKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approved: true
          })
        });

        if (!approveResponse.ok) {
          throw new Error(`Failed to approve review: ${approveResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Review approved successfully' })
        };

      case 'unapprove-review':
        // Unapprove a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const unapproveAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const unapproveResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'PATCH',
          headers: {
            'apikey': unapproveAuthKey,
            'Authorization': `Bearer ${unapproveAuthKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approved: false
          })
        });

        if (!unapproveResponse.ok) {
          throw new Error(`Failed to unapprove review: ${unapproveResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Review unapproved successfully' })
        };

      case 'approve-comment':
        // Approve a blog comment (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const approveCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${reviewId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approved: true
          })
        });

        if (!approveCommentResponse.ok) {
          throw new Error(`Failed to approve comment: ${approveCommentResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Comment approved successfully' })
        };

      case 'feature-review':
        // Feature a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const featureResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            featured: true,
            approved: true // Also approve when featuring
          })
        });

        if (!featureResponse.ok) {
          throw new Error(`Failed to feature review: ${featureResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Review featured successfully' })
        };

      case 'delete-review':
        // Delete a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const deleteAuthKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'DELETE',
          headers: {
            'apikey': deleteAuthKey,
            'Authorization': `Bearer ${deleteAuthKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete review: ${deleteResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Review deleted successfully' })
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

        const deleteCommentResponse = await fetch(`${SUPABASE_URL}/rest/v1/blog_comments?id=eq.${reviewId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
    console.error('Error managing reviews:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      action: action,
      hasReviewData: !!reviewData
    });
    
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        message: 'Failed to manage reviews',
        error: error.message,
        action: action,
        stack: error.stack
      })
    };
  }
};
