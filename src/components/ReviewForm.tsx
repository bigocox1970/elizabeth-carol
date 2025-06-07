import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewFormProps {
  onSuccess?: () => void;
}

const ReviewForm = ({ onSuccess }: ReviewFormProps) => {
  const { user, session } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name.trim() || !comment.trim() || !location.trim() || !service) {
      setMessage("Please provide your name, location, service type, and review.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      console.log("Submitting review...");
      // Submit review
      const response = await fetch("/.netlify/functions/manage-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add-general-review",
          reviewData: {
            name: name.trim(),
            email: email.trim(),
            location: location.trim(),
            service: service,
            rating,
            comment: comment.trim(),
            userId: user?.id || null,
          },
          userToken: session?.access_token || null,
        }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(result.message || "Thank you for your review! It will be published after approval.");
        
        // Reset form
        if (!user) {
          setName("");
          setEmail("");
        }
        setLocation("");
        setService("");
        setRating(5);
        setComment("");
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage(result.message || "Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setMessage("Connection error. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setMessage("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Let others know about your experience with Elizabeth Carol
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Birmingham, UK"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select value={service} onValueChange={setService} disabled={isSubmitting}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="One-to-One Reading">One-to-One Reading</SelectItem>
                  <SelectItem value="Group Reading">Group Reading</SelectItem>
                  <SelectItem value="Telephone Reading">Telephone Reading</SelectItem>
                  <SelectItem value="Home Psychic Evening">Home Psychic Evening</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRating(star)}
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !name.trim() || !comment.trim() || !location.trim() || !service}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>

            {message && !isSuccess && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{message}</p>
              </div>
            )}
          </form>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Thank you for sharing your experience!
            </p>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
              className="text-primary"
            >
              Submit Another Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
