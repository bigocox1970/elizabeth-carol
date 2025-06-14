import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserComments, getUserReviews, updateComment, updateReview, deleteComment, deleteReview, isUserAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Star, Edit, Trash2, LogOut, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Comment {
  id: number;
  content: string;
  post_id: number;
  approved: boolean;
  created_at: string;
}

interface Review {
  id: number;
  content: string;
  rating: number;
  approved: boolean;
  created_at: string;
  service: string;
  location?: string;
}

const UserProfile = () => {
  const { user, signOut, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedRating, setEditedRating] = useState(5);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchUserContent = async () => {
      setLoading(true);
      try {
        // Check if user is admin
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);

        // Fetch user's comments
        const { data: commentsData, error: commentsError } = await getUserComments();
        if (commentsError) throw commentsError;
        setComments(commentsData || []);

        // Fetch user's reviews
        const { data: reviewsData, error: reviewsError } = await getUserReviews();
        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Error fetching user content:", error);
        toast({
          title: "Error",
          description: "Failed to load your content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditedContent(comment.content);
    setCommentDialogOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditedContent(review.content);
    setEditedRating(review.rating);
    setReviewDialogOpen(true);
  };

  const handleSaveComment = async () => {
    if (!editingComment) return;

    try {
      const { error } = await updateComment(editingComment.id, editedContent);
      if (error) throw error;

      // Update local state
      setComments(comments.map(comment => 
        comment.id === editingComment.id 
          ? { ...comment, content: editedContent } 
          : comment
      ));

      toast({
        title: "Success",
        description: "Your comment has been updated.",
      });

      setEditingComment(null);
      setCommentDialogOpen(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update your comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;

    try {
      const { error } = await updateReview(editingReview.id, editedContent, editedRating);
      if (error) throw error;

      // Update local state
      setReviews(reviews.map(review => 
        review.id === editingReview.id 
          ? { ...review, content: editedContent, rating: editedRating } 
          : review
      ));

      toast({
        title: "Success",
        description: "Your review has been updated.",
      });

      setEditingReview(null);
      setReviewDialogOpen(false);
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: "Failed to update your review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      const { error } = await deleteComment(id);
      if (error) throw error;

      // Update local state
      setComments(comments.filter(comment => comment.id !== id));

      toast({
        title: "Success",
        description: "Your comment has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete your comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      const { error } = await deleteReview(id);
      if (error) throw error;

      // Update local state
      setReviews(reviews.filter(review => review.id !== id));

      toast({
        title: "Success",
        description: "Your review has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete your review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingComment(null);
    setCommentDialogOpen(false);
    setEditedContent("");
  };

  const handleCancelReviewEdit = () => {
    setEditingReview(null);
    setReviewDialogOpen(false);
    setEditedContent("");
    setEditedRating(5);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ));
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.user_metadata?.name || "User"}'s Profile</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Comments</CardTitle>
                  <CardDescription>
                    Manage the comments you've left on blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading your comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't left any comments yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <Card key={comment.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditComment(comment)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Your Comment</DialogTitle>
                                    <DialogDescription>
                                      Make changes to your comment below.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Textarea
                                      value={editedContent}
                                      onChange={(e) => setEditedContent(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={handleCancelCommentEdit}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveComment}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this comment? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <div className="flex mb-2 pr-20">{renderStars(5)}</div>
                            <p className="text-sm pr-20">{comment.content}</p>
                            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              <span className={comment.approved ? "text-green-600" : "text-amber-600"}>
                                {comment.approved ? "Approved" : "Pending Approval"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Reviews</CardTitle>
                  <CardDescription>
                    Manage the reviews you've left for Elizabeth Carol's services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading your reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      You haven't left any reviews yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="relative">
                          <CardContent className="pt-6">
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditReview(review)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Your Review</DialogTitle>
                                    <DialogDescription>
                                      Make changes to your review below.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="rating">Rating</Label>
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Button
                                            key={star}
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditedRating(star)}
                                          >
                                            <Star
                                              className={`w-6 h-6 ${
                                                star <= editedRating
                                                  ? "text-yellow-500 fill-yellow-500"
                                                  : "text-gray-300"
                                              }`}
                                            />
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="content">Review</Label>
                                      <Textarea
                                        id="content"
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="min-h-[100px]"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={handleCancelReviewEdit}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleSaveReview}>Save Changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this review? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                            <div className="flex mb-2">{renderStars(review.rating)}</div>
                            <p className="text-sm">{review.content}</p>
                            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                              <span>
                                {review.service} • {new Date(review.created_at).toLocaleDateString()}
                              </span>
                              <span className={review.approved ? "text-green-600" : "text-amber-600"}>
                                {review.approved ? "Approved" : "Pending Approval"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdmin && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Admin Access</h3>
                      <Button
                        onClick={() => navigate("/admin")}
                        className="w-full bg-gradient-mystical hover:opacity-90 text-primary-foreground"
                      >
                        Access Admin Dashboard
                      </Button>
                    </div>
                  )}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword || !newPassword || !confirmPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
