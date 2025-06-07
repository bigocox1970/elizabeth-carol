const SUPABASE_URL = 'https://itsxxdxyigsyqxkeonqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c3h4ZHh5aWdzeXF4a2VvbnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMDQ1NjgsImV4cCI6MjA2NDg4MDU2OH0.YeWzqm0FsIBs8ojIdyMSkprWn1OA4SfFgB2DM3j2ko';

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, reviewData, reviewId, postId } = JSON.parse(event.body || '{}');

  // Authentication check for admin operations
  const isAdmin = password === 'elizabeth2024';

  try {
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

        // Add to reviews table
        const addReviewResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            name: reviewData.name,
            email: reviewData.email || '',
            rating: parseInt(reviewData.rating),
            title: reviewData.title || '',
            content: reviewData.comment,
            service: reviewData.service || 'General',
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
          rating: newReview.rating,
          comment: newReview.content,
          service: newReview.service,
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
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const allReviewsResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!allReviewsResponse.ok) {
          throw new Error(`Database query failed: ${allReviewsResponse.status}`);
        }

        const allReviews = await allReviewsResponse.json();

        // Format reviews for frontend
        const formattedAllReviews = allReviews.map(review => ({
          id: review.id.toString(),
          name: review.name,
          email: review.email,
          rating: review.rating,
          title: review.title,
          comment: review.content,
          service: review.service,
          approved: review.approved,
          featured: review.featured,
          createdAt: review.created_at
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ reviews: formattedAllReviews })
        };

      case 'get-approved-reviews':
        // Get approved reviews for public display
        const approvedReviewsResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?approved=eq.true&select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!approvedReviewsResponse.ok) {
          throw new Error(`Database query failed: ${approvedReviewsResponse.status}`);
        }

        const approvedReviews = await approvedReviewsResponse.json();

        // Format reviews for frontend
        const formattedApprovedReviews = approvedReviews.map(review => ({
          id: review.id.toString(),
          name: review.name,
          email: review.email,
          rating: review.rating,
          title: review.title,
          comment: review.content,
          service: review.service,
          approved: review.approved,
          featured: review.featured,
          createdAt: review.created_at
        }));

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ reviews: formattedApprovedReviews })
        };

      case 'approve-review':
        // Approve a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        const approveResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
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

        if (!approveResponse.ok) {
          throw new Error(`Failed to approve review: ${approveResponse.status}`);
        }

        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: 'Review approved successfully' })
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

        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: 'Failed to manage reviews' })
    };
  }
};
