import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, RefreshCw, Check, X } from "lucide-react";
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

  useEffect(() => {
    if (session) {
      loadReviews();
    }
  }, [session]);

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
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No reviews yet
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{review.name}</h3>
                    <p className="text-xs text-muted-foreground">{review.email}</p>
                    {review.location && (
                      <p className="text-xs text-muted-foreground">📍 {review.location}</p>
                    )}
                    {review.service && (
                      <p className="text-xs text-blue-600 font-medium">🔮 {review.service}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!review.approved && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleApproveReview(review.id, true)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteReview(review.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex mb-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {review.comment}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                  <Badge variant={review.approved ? "default" : "outline"}>
                    {review.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
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
