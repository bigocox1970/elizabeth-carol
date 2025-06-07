const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  const { httpMethod } = event;
  const { action, password, reviewData, reviewId, postId } = JSON.parse(event.body || '{}');

  // Authentication check for admin operations
  const isAdmin = password === 'elizabeth2024';

  const reviewsFilePath = path.join(process.cwd(), 'data', 'reviews.json');
  const blogFilePath = path.join(process.cwd(), 'data', 'blog-posts.json');

  try {
    switch (action) {
      case 'add-general-review':
        // Add a general service review
        if (!reviewData.name || !reviewData.rating || !reviewData.comment) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Name, rating, and comment are required' })
          };
        }

        let reviews = [];
        try {
          const data = await fs.readFile(reviewsFilePath, 'utf8');
          reviews = JSON.parse(data);
        } catch (err) {
          reviews = [];
        }

        const newReview = {
          id: Date.now().toString(),
          name: reviewData.name,
          email: reviewData.email || '',
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment,
          service: reviewData.service || 'General',
          approved: false, // Requires admin approval
          createdAt: new Date().toISOString(),
          type: 'general'
        };

        reviews.push(newReview);
        await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2));

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Thank you for your review! It will be published after approval.',
            review: newReview
          })
        };

      case 'add-blog-review':
        // Add a review to a specific blog post
        if (!reviewData.name || !reviewData.rating || !reviewData.comment || !postId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Name, rating, comment, and post ID are required' })
          };
        }

        let blogPosts = [];
        try {
          const data = await fs.readFile(blogFilePath, 'utf8');
          blogPosts = JSON.parse(data);
        } catch (err) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Blog post not found' })
          };
        }

        const postIndex = blogPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Blog post not found' })
          };
        }

        const blogReview = {
          id: Date.now().toString(),
          name: reviewData.name,
          email: reviewData.email || '',
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment,
          approved: false,
          createdAt: new Date().toISOString()
        };

        if (!blogPosts[postIndex].reviews) {
          blogPosts[postIndex].reviews = [];
        }
        blogPosts[postIndex].reviews.push(blogReview);

        await fs.writeFile(blogFilePath, JSON.stringify(blogPosts, null, 2));

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Thank you for your comment! It will be published after approval.',
            review: blogReview
          })
        };

      case 'get-all-reviews':
        // Get all reviews for admin
        if (!isAdmin) {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        let allReviews = [];
        try {
          const data = await fs.readFile(reviewsFilePath, 'utf8');
          allReviews = JSON.parse(data);
        } catch (err) {
          allReviews = [];
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            reviews: allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          })
        };

      case 'get-approved-reviews':
        // Get approved reviews for public display
        let publicReviews = [];
        try {
          const data = await fs.readFile(reviewsFilePath, 'utf8');
          publicReviews = JSON.parse(data).filter(review => review.approved);
        } catch (err) {
          publicReviews = [];
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            reviews: publicReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          })
        };

      case 'approve-review':
        // Approve a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        let reviewsToApprove = [];
        try {
          const data = await fs.readFile(reviewsFilePath, 'utf8');
          reviewsToApprove = JSON.parse(data);
        } catch (err) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Reviews not found' })
          };
        }

        const reviewIndex = reviewsToApprove.findIndex(r => r.id === reviewId);
        if (reviewIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Review not found' })
          };
        }

        reviewsToApprove[reviewIndex].approved = true;
        await fs.writeFile(reviewsFilePath, JSON.stringify(reviewsToApprove, null, 2));

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Review approved successfully' })
        };

      case 'delete-review':
        // Delete a review (admin only)
        if (!isAdmin) {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' })
          };
        }

        let reviewsToDelete = [];
        try {
          const data = await fs.readFile(reviewsFilePath, 'utf8');
          reviewsToDelete = JSON.parse(data);
        } catch (err) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Reviews not found' })
          };
        }

        const deleteIndex = reviewsToDelete.findIndex(r => r.id === reviewId);
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Review not found' })
          };
        }

        reviewsToDelete.splice(deleteIndex, 1);
        await fs.writeFile(reviewsFilePath, JSON.stringify(reviewsToDelete, null, 2));

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Review deleted successfully' })
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid action' })
        };
    }

  } catch (error) {
    console.error('Error managing reviews:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to manage reviews' })
    };
  }
}; 