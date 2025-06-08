import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft, Star, MessageCircle, Send, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get-single',
          postId: postId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewMessage('You must be logged in to comment.');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewMessage('');

    try {
      const response = await fetch('/.netlify/functions/manage-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
                  body: JSON.stringify({
            action: 'add-comment',
            postId: postId,
            commentData: {
            name: user.email.split('@')[0], // Use email username as name
            email: user.email,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            userId: user.id // Add the user ID for linking
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviewMessage(data.message);
        setReviewForm({ name: '', email: '', rating: 5, comment: '' });
        // Reload post to show new review count
        loadPost();
      } else {
        setReviewMessage(data.message || 'Failed to submit review.');
      }
    } catch (error) {
      setReviewMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button className="bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const approvedReviews = post.reviews ? post.reviews.filter(r => r.approved) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Back Button */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <Link to="/blog">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Article */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(post.createdAt)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getReadTime(post.content)}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                {post.title}
              </h1>
              
              {approvedReviews.length > 0 && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {approvedReviews.length} comments
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {(approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)} average rating
                  </div>
                </div>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Reviews Section */}
            <section className="space-y-8">
              {/* Reviews Display */}
              {approvedReviews.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-6">
                    Reader Comments ({approvedReviews.length})
                  </h3>
                  <div className="space-y-6">
                    {approvedReviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{review.name}</h4>
                              <div className="flex items-center mt-1">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Share Your Thoughts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="text-center py-8">
                      <LogIn className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Login Required</h3>
                      <p className="text-muted-foreground mb-6">
                        Please log in to leave a comment on this blog post.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={() => navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname))}
                          className="bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/auth?mode=register&redirect=' + encodeURIComponent(window.location.pathname))}
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="bg-secondary/20 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Commenting as <span className="font-semibold text-foreground">{user.email}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Rating *</Label>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewForm({...reviewForm, rating: i + 1})}
                              className="p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  i < reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comment">Comment *</Label>
                        <Textarea
                          id="comment"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                          placeholder="Share your thoughts about this post..."
                          rows={4}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmittingReview}
                        className="bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmittingReview ? 'Submitting...' : 'Submit Comment'}
                      </Button>

                      {reviewMessage && (
                        <div className={`p-3 rounded-md ${reviewMessage.includes('approval') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          <p className="text-sm">{reviewMessage}</p>
                        </div>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost; 