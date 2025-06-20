const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('--- manage-reviews function invoked ---');
    console.log('Event body:', event.body);
    console.log('Event headers:', event.headers);

    const { action, reviewData, reviewId, userToken } = JSON.parse(event.body || '{}');
    console.log('Parsed request:', { action, reviewId, reviewData: reviewData ? '[REDACTED]' : null });

    // Get the user's JWT token from the Authorization header or userToken
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    let token = userToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null);
    
    console.log('Token extracted:', token ? '[REDACTED]' : 'None');
    console.log('Auth header:', authHeader ? '[REDACTED]' : 'None');

    // Environment variables check
    console.log('SUPABASE_URL:', SUPABASE_URL ? 'Exists' : 'Missing');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Exists' : 'Missing');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Server configuration error' })
      };
    }

    console.log('Processing action:', action);

    // Only require auth for write operations
    if (['approve-review', 'unapprove-review', 'delete-review'].includes(action)) {
      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'No authorization token provided' })
        };
      }

      // Verify admin status
      try {
        const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          console.error('Failed to get user info:', await userResponse.text());
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Invalid token' })
          };
        }

        const userData = await userResponse.json();
        
        // Check if user is admin
        const adminCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userData.id })
        });

        if (!adminCheckResponse.ok) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Failed to verify admin status' })
          };
        }

        const isAdminResult = await adminCheckResponse.json();
        if (!isAdminResult) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Error verifying admin status', error: error.message })
        };
      }
    }

    switch (action) {
      case 'add-general-review':
        // Add a general service review
        if (!reviewData.name || !reviewData.rating || !reviewData.comment) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Name, rating, and comment are required' })
          };
        }

        // Allow anonymous reviews
        let authHeaders = {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        };
        
        // If user is authenticated, use their token
        if (userToken && reviewData.userId) {
          authHeaders['Authorization'] = `Bearer ${userToken}`;
        } else {
          // For anonymous reviews, use service role key to bypass RLS
          authHeaders['Authorization'] = `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`;
          console.log('Using service role key for anonymous review');
        }

        console.log('Adding review for authenticated user:', reviewData.userId);
        
        let addReviewResponse;
        try {
          addReviewResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: reviewData.name,
              email: reviewData.email || '',
              rating: parseInt(reviewData.rating),
              title: reviewData.title || '',
              content: reviewData.comment,
              user_id: reviewData.userId,
              approved: false, // Requires admin approval
              // Only include location and service if they're provided
              ...(reviewData.location ? { location: reviewData.location } : {}),
              ...(reviewData.service ? { service: reviewData.service } : {})
            })
          });

          if (!addReviewResponse.ok) {
            const errorText = await addReviewResponse.text();
            console.error('Review submission error details:', errorText);
            throw new Error(`Failed to add review: ${addReviewResponse.status} - ${errorText}`);
          }
        } catch (error) {
          console.error('Error in review submission:', error);
          throw error;
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
          headers,
          body: JSON.stringify({ 
            message: 'Thank you for your review! It will be published after approval.',
            review: formattedNewReview
          })
        };

      case 'get-all-reviews':
        // Return all reviews, sorted by date (newest first)
        console.log('Fetching all reviews from Supabase');
        console.log('Using URL:', `${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`);
        
        const allResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('All reviews response status:', allResponse.status);
        console.log('All reviews response headers:', allResponse.headers);

        if (!allResponse.ok) {
          const errorText = await allResponse.text();
          console.error('All reviews response error:', errorText);
          throw new Error(`Database query failed: ${allResponse.status} - ${errorText}`);
        }

        const allReviews = await allResponse.json();
        console.log('Retrieved reviews:', JSON.stringify(allReviews, null, 2));
        
        // Format reviews for frontend
        const formattedReviews = allReviews.map(review => ({
          id: review.id.toString(),
          name: review.name,
          email: review.email,
          location: review.location,
          service: review.service,
          rating: review.rating,
          comment: review.content,
          approved: review.approved,
          createdAt: review.created_at
        }));

        console.log('Formatted reviews:', JSON.stringify(formattedReviews, null, 2));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ reviews: formattedReviews })
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
          console.log('Retrieved approved reviews:', JSON.stringify(approvedReviews, null, 2));

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

          console.log('Formatted approved reviews:', JSON.stringify(formattedApprovedReviews, null, 2));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reviews: formattedApprovedReviews })
          };
        } catch (error) {
          console.error('Error getting approved reviews:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              message: 'Failed to retrieve approved reviews',
              error: error.message
            })
          };
        }

      case 'approve-review':
      case 'unapprove-review':
        // Check if user is authenticated and is admin
        if (!token) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Authentication required' })
          };
        }

        // Verify admin status
        try {
          const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!userResponse.ok) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({ message: 'Invalid token' })
            };
          }

          const userData = await userResponse.json();
          
          // Check if user is admin
          const adminCheckResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userData.id })
          });

          if (!adminCheckResponse.ok) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ message: 'Failed to verify admin status' })
            };
          }

          const isAdminResult = await adminCheckResponse.json();
          if (!isAdminResult) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ message: 'Admin access required' })
            };
          }

          // Update review approval status
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              approved: action === 'approve-review'
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Review update error:', errorText);
            throw new Error(`Failed to update review: ${updateResponse.status} - ${errorText}`);
          }

          const updatedReview = await updateResponse.json();
          console.log('Review updated successfully:', updatedReview);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              message: 'Review updated successfully',
              review: updatedReview[0]
            })
          };

        } catch (error) {
          console.error('Error in review approval:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              message: 'Failed to update review',
              error: error.message
            })
          };
        }

      case 'approve-comment':
        // Approve a blog comment (admin only)
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
          headers,
          body: JSON.stringify({ message: 'Comment approved successfully' })
        };

      case 'feature-review':
        // Feature a review (admin only)
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
          headers,
          body: JSON.stringify({ message: 'Review featured successfully' })
        };

      case 'delete-review':
        // Delete a review
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete review: ${deleteResponse.status}`);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Review deleted successfully' })
        };

      case 'delete-comment':
        // Delete a blog comment (admin only)
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
          headers,
          body: JSON.stringify({ message: 'Comment deleted successfully' })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Unhandled error in manage-reviews function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};
