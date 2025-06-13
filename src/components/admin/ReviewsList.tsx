import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, RefreshCw, Check, X, Quote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface Review {
  id: string;
  name: string;
  email: string;
  location?: string;
  service?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

const ReviewsList = () => {
  const { session } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) {
      loadReviews();
    }
  }, [session]);

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const loadReviews = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      console.log('Loading reviews...');
      const response = await fetch(getApiUrl('manage-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'get-all-reviews'
        }),
      });

      console.log('Reviews response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reviews data received:', data);
        setReviews(data.reviews || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load reviews:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    if (!session) return;

    try {
      const response = await fetch(getApiUrl('manage-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: approve ? 'approve-review' : 'unapprove-review',
          reviewId: reviewId
        }),
      });

      if (response.ok) {
        loadReviews();
      } else {
        alert('Failed to update review.');
      }
    } catch (error) {
      alert('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(getApiUrl('manage-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete-review',
          reviewId: reviewId
        }),
      });

      if (response.ok) {
        loadReviews();
      } else {
        alert('Failed to delete review.');
      }
    } catch (error) {
      alert('Failed to delete review. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <span>Reviews ({reviews.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No reviews yet
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id);
              const shouldTruncate = review.comment && review.comment.length > 150;
              const displayText = shouldTruncate && !isExpanded 
                ? truncateText(review.comment, 150)
                : review.comment;

              return (
                <Card key={review.id} className="h-fit hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    {/* Admin Actions */}
                    <div className="flex justify-end space-x-1 mb-3">
                      {!review.approved && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleApproveReview(review.id, true)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.approved && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleApproveReview(review.id, false)}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                          title="Unapprove"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteReview(review.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quote Icon */}
                    <Quote className="w-6 h-6 text-primary mb-3" />

                    {/* Review Content */}
                    <blockquote className="mb-4 text-sm">
                      "{displayText}"
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(review.id)}
                          className="ml-2 text-primary hover:text-primary/80 font-medium text-sm underline"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </blockquote>

                    {/* Review Details */}
                    <div className="space-y-2">
                      <div className="flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">{review.name}</h4>
                        <p className="text-xs text-muted-foreground">{review.email}</p>
                        
                        {review.location && (
                          <p className="text-xs text-muted-foreground">📍 {review.location}</p>
                        )}
                        
                        {review.service && (
                          <p className="text-xs text-blue-600 font-medium">🔮 {review.service}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                        <Badge variant={review.approved ? "default" : "outline"}>
                          {review.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <Button 
          onClick={loadReviews}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
