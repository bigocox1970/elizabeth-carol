import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface ReviewFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const ReviewForm = ({ onSuccess, onClose }: ReviewFormProps) => {
  const { user, session } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    location?: string;
    service?: string;
    rating?: string;
    comment?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    setMessage("");
    
    // Client-side validation
    const newErrors: {
      name?: string;
      location?: string;
      service?: string;
      rating?: string;
      comment?: string;
    } = {};
    
    if (!name.trim()) newErrors.name = "Please enter your name";
    if (!location.trim()) newErrors.location = "Please enter your location";
    if (!service) newErrors.service = "Please select a service type";
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!comment.trim()) newErrors.comment = "Please enter your review";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      console.log("Submitting review with user ID:", user?.id);
      
      // Submit review
      const response = await fetch(getApiUrl("manage-reviews"), {
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

      // Get the response text first for debugging
      const responseText = await response.text();
      console.log("Review submission response:", responseText);
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error(`Invalid response: ${responseText}`);
      }
      
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
    <Card className="w-full max-w-md mx-auto relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
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
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
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
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select value={service} onValueChange={setService} disabled={isSubmitting}>
                <SelectTrigger id="service" className={errors.service ? "border-red-500" : ""}>
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
              {errors.service && (
                <p className="text-sm text-red-500">{errors.service}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1">
                <p className="text-sm text-gray-500 mb-1 w-full">Click to select your rating</p>
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
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`min-h-[100px] ${errors.comment ? "border-red-500" : ""}`}
                disabled={isSubmitting}
                required
              />
              {errors.comment && (
                <p className="text-sm text-red-500">{errors.comment}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
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
