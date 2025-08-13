import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserComments, getUserReviews, updateComment, updateReview, deleteComment, deleteReview, isUserAdmin, getUserBookings, updateBookingUserNotes, cancelBooking, createReviewForBooking, deleteBooking } from "@/lib/supabase";
import { sendBookingCancellationEmail } from "@/lib/emailService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Star, Edit, Trash2, LogOut, User, Calendar, Clock, MessageSquare, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

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

interface Booking {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reading_type: 'in_person' | 'video' | 'telephone';
  notes?: string;
  user_notes?: string;
  created_at: string;
  availability_slots: {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    service_type: string;
    notes?: string;
  };
}

const UserProfile = () => {
  const { user, signOut, updatePassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(""); // Start with empty string to avoid race condition
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
  
  // Profile editing state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Booking-related state
  const [editingBookingNotes, setEditingBookingNotes] = useState<number | null>(null);
  const [bookingNotesContent, setBookingNotesContent] = useState("");
  const [reviewDialogBooking, setReviewDialogBooking] = useState<Booking | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [fullScreenNotesOpen, setFullScreenNotesOpen] = useState(false);
  const [fullScreenNotesBooking, setFullScreenNotesBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return;
    
    if (!user) {
      navigate("/");
      return;
    }

    const fetchUserContent = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Check if user is admin first
        const adminStatus = await isUserAdmin();
        console.log('Admin status for user:', user.email, 'is:', adminStatus);
        setIsAdmin(adminStatus);

        // Set default tab based on admin status and URL parameters
        const tabParam = searchParams.get('tab');
        console.log('URL tab parameter:', tabParam);
        if (tabParam && ['readings', 'comments', 'reviews', 'account'].includes(tabParam)) {
          console.log('Setting tab from URL parameter:', tabParam);
          setActiveTab(tabParam);
        } else {
          // Set default tab based on admin status
          const defaultTab = adminStatus ? "account" : "readings";
          console.log('Setting default tab based on admin status:', defaultTab);
          setActiveTab(defaultTab);
        }

        // Load user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();

        // If profile is missing or phone is missing, sync from Auth metadata
        if (!profile || !profile.phone) {
          const phoneFromAuth = user.user_metadata?.phone || '';
          const nameFromAuth = user.user_metadata?.name || '';
          const emailFromAuth = user.email || '';
          await supabase.from('profiles').upsert({
            id: user.id,
            name: nameFromAuth,
            email: emailFromAuth,
            phone: phoneFromAuth
          });
        }

        if (profile) {
          setProfileData({
            name: profile.name || user.user_metadata?.name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || user.user_metadata?.phone || ''
          });
        } else {
          // Fallback to user metadata if no profile found
          setProfileData({
            name: user.user_metadata?.name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || ''
          });
        }

        // Load user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        } else {
          setComments(commentsData || []);
        }

        // Load user's reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          setReviews(reviewsData || []);
        }

        // Load user's bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            availability_slots (
              id,
              date,
              start_time,
              end_time,
              service_type,
              notes
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          setBookings(bookingsData || []);
        }
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user, navigate, toast, authLoading, searchParams]);

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
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

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

    try {
      setIsChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      setIsUpdatingProfile(true);

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Booking-related handlers
  const handleEditBookingNotes = (booking: Booking) => {
    setEditingBookingNotes(booking.id);
    setBookingNotesContent(booking.user_notes || "");
  };

  const handleFullScreenNotesEdit = (booking: Booking) => {
    setFullScreenNotesBooking(booking);
    setBookingNotesContent(booking.user_notes || "");
    setFullScreenNotesOpen(true);
  };

  const handleSaveFullScreenNotes = async () => {
    if (!fullScreenNotesBooking) return;
    
    try {
      const { error } = await updateBookingUserNotes(fullScreenNotesBooking.id, bookingNotesContent);
      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === fullScreenNotesBooking.id 
          ? { ...booking, user_notes: bookingNotesContent } 
          : booking
      ));

      toast({
        title: "Success",
        description: "Your notes have been saved.",
      });

      setFullScreenNotesOpen(false);
      setFullScreenNotesBooking(null);
      setBookingNotesContent("");
    } catch (error) {
      console.error("Error updating booking notes:", error);
      toast({
        title: "Error",
        description: "Failed to save your notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBookingNotes = async (bookingId: number) => {
    try {
      const { error } = await updateBookingUserNotes(bookingId, bookingNotesContent);
      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, user_notes: bookingNotesContent } 
          : booking
      ));

      toast({
        title: "Success",
        description: "Your notes have been saved.",
      });

      setEditingBookingNotes(null);
    } catch (error) {
      console.error("Error updating booking notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const { error } = await cancelBooking(bookingId);
      if (error) throw error;

      setBookings(bookings.map(b => 
        b.id === bookingId 
          ? { ...b, status: 'cancelled' as const } 
          : b
      ));

      // Send cancellation emails
      try {
        const refundAmount = getCancellationRefund(booking);
        const readingTypeDisplay = booking.reading_type === 'in_person' ? 'One to One (In-person)' :
                                  booking.reading_type === 'video' ? 'Video Call Reading' : 'Telephone Reading';

        const emailData = {
          customerEmail: user?.email || '',
          customerName: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Customer',
          date: formatDate(booking.availability_slots.date),
          time: `${formatTime(booking.availability_slots.start_time)} - ${formatTime(booking.availability_slots.end_time)}`,
          serviceType: readingTypeDisplay,
          refundAmount: refundAmount.includes('50%') ? '50% refund' : undefined
        };

        await sendBookingCancellationEmail(emailData);
        console.log('✅ Cancellation emails sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Failed to send cancellation emails:', emailError);
        // Don't fail the cancellation if emails fail
      }

      toast({
        title: "Success",
        description: "Your booking has been cancelled. Confirmation emails have been sent.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReview = async () => {
    if (!reviewDialogBooking) return;

    try {
      const readingTypeDisplay = reviewDialogBooking.reading_type === 'in_person' ? 'One to One (In-person)' :
                                reviewDialogBooking.reading_type === 'video' ? 'Video Call' : 'Telephone';
      
      const { error } = await createReviewForBooking(
        reviewDialogBooking.id, 
        reviewContent, 
        reviewRating, 
        readingTypeDisplay
      );
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Your review has been submitted and is pending approval.",
      });

      setReviewDialogBooking(null);
      setReviewContent("");
      setReviewRating(5);
    } catch (error) {
      console.error("Error creating review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      const { error } = await deleteBooking(bookingId);
      if (error) throw error;

      // Update local state
      setBookings(bookings.filter(booking => booking.id !== bookingId));

      toast({
        title: "Success",
        description: "Cancelled booking has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
    
    const bookingDateTime = new Date(`${booking.availability_slots.date}T${booking.availability_slots.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilBooking >= 48;
  };

  const getCancellationRefund = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.availability_slots.date}T${booking.availability_slots.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking >= 48) return "50% refund";
    return "No refund";
  };

  const hasReadingDatePassed = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.availability_slots.date}T${booking.availability_slots.end_time}`);
    const now = new Date();
    return now > bookingDateTime;
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

          <Tabs value={activeTab || "readings"} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="readings">Readings</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="readings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Readings</CardTitle>
                  <CardDescription>
                    Manage your bookings, add notes, and leave reviews for completed readings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading your readings...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>You haven't booked any readings yet.</p>
                      <Button className="mt-4" onClick={() => navigate("/contact")}>
                        Book Your First Reading
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Cancellation Policy */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Cancellation Policy
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          • <strong>100% refund</strong> if cancelled 48+ hours before your reading<br/>
                          • <strong>Unable to cancel</strong> less than 48 hours before your reading
                        </p>
                      </div>

                      {/* Bookings List */}
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <Card key={booking.id} className="relative">
                            <CardContent className="pt-6">

                              {/* Reading Details */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {booking.reading_type === 'in_person' ? 'One to One (In-person)' :
                                     booking.reading_type === 'video' ? 'Video Call Reading' : 'Telephone Reading'}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(booking.availability_slots.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatTime(booking.availability_slots.start_time)} - {formatTime(booking.availability_slots.end_time)}
                                    </span>
                                  </div>
                                </div>

                                {/* Elizabeth's Notes */}
                                {booking.notes ? (
                                  <div className={`w-full rounded-lg p-4 ${
                                    booking.status === 'confirmed' || booking.status === 'completed'
                                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                                      : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                                  }`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className={`font-medium ${
                                        booking.status === 'confirmed' || booking.status === 'completed'
                                          ? 'text-green-900 dark:text-green-100'
                                          : 'text-red-900 dark:text-red-100'
                                      }`}>Elizabeth's Notes:</h5>
                                      <Badge 
                                        variant={
                                          booking.status === 'confirmed' ? 'default' :
                                          booking.status === 'pending' ? 'secondary' :
                                          booking.status === 'completed' ? 'outline' :
                                          'destructive'
                                        }
                                        className={
                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-300' :
                                          booking.status === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                          ''
                                        }
                                      >
                                        {booking.status === 'pending' && '⏳ '}
                                        {booking.status === 'confirmed' && '✅ '}
                                        {booking.status === 'completed' && '🎉 '}
                                        {booking.status === 'cancelled' && '❌ '}
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                      </Badge>
                                    </div>
                                    <div className={`text-sm leading-relaxed w-full ${
                                      booking.status === 'confirmed' || booking.status === 'completed'
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-red-800 dark:text-red-200'
                                    }`}>
                                      <p className="mb-2">{booking.notes}</p>
                                      {(booking.status === 'confirmed' || booking.status === 'completed') && booking.reading_type === 'in_person' && (
                                        <div className="mt-3 pt-2 border-t border-green-200 dark:border-green-700">
                                          <p className="font-medium mb-2">✅ Your reading is confirmed!</p>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span>📍 Address:</span>
                                              <a 
                                                href="https://www.google.com/maps/search/?api=1&query=45+Southend,+Garsington,+Oxford+OX44+9DJ"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline font-medium"
                                              >
                                                45 Southend, Garsington, Oxford OX44 9DJ
                                              </a>
                                            </div>
                                            <p className="text-xs opacity-75">Click the address above to open in Google Maps for directions</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <Badge 
                                      variant={
                                        booking.status === 'confirmed' ? 'default' :
                                        booking.status === 'pending' ? 'secondary' :
                                        booking.status === 'completed' ? 'outline' :
                                        'destructive'
                                      }
                                      className={
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-300' :
                                        booking.status === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                        ''
                                      }
                                    >
                                      {booking.status === 'pending' && '⏳ '}
                                      {booking.status === 'confirmed' && '✅ '}
                                      {booking.status === 'completed' && '🎉 '}
                                      {booking.status === 'cancelled' && '❌ '}
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                  </div>
                                )}

                                {/* User Notes Section */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 w-full">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium flex items-center gap-2">
                                      <MessageSquare className="w-4 h-4" />
                                      Your Notes
                                    </h5>
                                    {editingBookingNotes === booking.id ? (
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSaveBookingNotes(booking.id)}>
                                          Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingBookingNotes(null)}>
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleFullScreenNotesEdit(booking)}>
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  {editingBookingNotes === booking.id ? (
                                    <div className="space-y-3">
                                      <Textarea
                                        value={bookingNotesContent}
                                        onChange={(e) => setBookingNotesContent(e.target.value)}
                                        placeholder="Add your notes about this reading..."
                                        className="min-h-[120px] w-full resize-y"
                                      />
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleFullScreenNotesEdit(booking)}
                                        className="w-full md:hidden"
                                      >
                                        Open Full Screen Editor
                                      </Button>
                                    </div>
                                  ) : (
                                    <div 
                                      className="text-sm text-muted-foreground w-full leading-relaxed cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                                      onClick={() => handleFullScreenNotesEdit(booking)}
                                    >
                                      {booking.user_notes || "No notes added yet. Tap here to add your thoughts about this reading."}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {/* Cancel Button */}
                                  {canCancelBooking(booking) ? (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                                          Cancel Booking (100% refund)
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to cancel this booking? You will receive a 100% refund.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleCancelBooking(booking.id)}
                                            className="bg-orange-600 hover:bg-orange-700"
                                          >
                                            Cancel Booking
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  ) : (
                                    <div className="text-sm text-red-600 font-medium py-2">Unable to cancel this close to your booking</div>
                                  )}

                                  {/* Review Button - Show when reading date has passed and booking was confirmed */}
                                  {(booking.status === 'completed' || (booking.status === 'confirmed' && hasReadingDatePassed(booking))) && (
                                    <Dialog open={reviewDialogBooking?.id === booking.id} onOpenChange={(open) => !open && setReviewDialogBooking(null)}>
                                      <DialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => setReviewDialogBooking(booking)}
                                        >
                                          <Star className="w-4 h-4 mr-1" />
                                          Leave Review
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Leave a Review</DialogTitle>
                                          <DialogDescription>
                                            Share your experience with this reading to help others
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label>Rating</Label>
                                            <div className="flex space-x-1">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <Button
                                                  key={star}
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => setReviewRating(star)}
                                                >
                                                  <Star
                                                    className={`w-6 h-6 ${
                                                      star <= reviewRating
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : "text-gray-300"
                                                    }`}
                                                  />
                                                </Button>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Your Review</Label>
                                            <Textarea
                                              value={reviewContent}
                                              onChange={(e) => setReviewContent(e.target.value)}
                                              placeholder="Tell others about your experience with Elizabeth Carol..."
                                              className="min-h-[100px]"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setReviewDialogBooking(null)}>
                                            Cancel
                                          </Button>
                                          <Button onClick={handleCreateReview} disabled={!reviewContent.trim()}>
                                            Submit Review
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  )}

                                  {/* Delete Button for Cancelled Bookings */}
                                  {booking.status === 'cancelled' && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                                          <Trash2 className="w-4 h-4 mr-1" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Cancelled Booking</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to permanently delete this cancelled booking? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteBooking(booking.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete Permanently
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>

                                {/* Booking Date */}
                                <div className="text-xs text-muted-foreground pt-2 border-t">
                                  Booked on {new Date(booking.created_at).toLocaleDateString('en-GB')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

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
                    <h3 className="text-lg font-semibold">Profile Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="profileName">Name</Label>
                      <Input
                        id="profileName"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileEmail">Email</Label>
                      <Input
                        id="profileEmail"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profilePhone">Phone Number</Label>
                      <Input
                        id="profilePhone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Your phone number"
                      />
                      <p className="text-xs text-muted-foreground">Used for booking confirmations and contact purposes.</p>
                    </div>
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isUpdatingProfile}
                      className="w-full"
                    >
                      {isUpdatingProfile ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                  
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

      {/* Full Screen Notes Modal */}
      <Dialog open={fullScreenNotesOpen} onOpenChange={setFullScreenNotesOpen}>
        <DialogContent className="max-w-full h-full m-0 p-0 rounded-none">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Notes - {fullScreenNotesBooking?.reading_type === 'in_person' ? 'One to One (In-person)' :
                             fullScreenNotesBooking?.reading_type === 'video' ? 'Video Call Reading' : 'Telephone Reading'}
              </DialogTitle>
              <DialogDescription>
                {fullScreenNotesBooking && formatDate(fullScreenNotesBooking.availability_slots.date)} at{' '}
                {fullScreenNotesBooking && formatTime(fullScreenNotesBooking.availability_slots.start_time)} -{' '}
                {fullScreenNotesBooking && formatTime(fullScreenNotesBooking.availability_slots.end_time)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 p-6">
              <Textarea
                value={bookingNotesContent}
                onChange={(e) => setBookingNotesContent(e.target.value)}
                placeholder="Add your notes about this reading..."
                className="w-full h-full min-h-[400px] resize-none text-base leading-relaxed"
              />
            </div>
            
            <div className="p-6 border-t bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFullScreenNotesOpen(false);
                    setFullScreenNotesBooking(null);
                    setBookingNotesContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFullScreenNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
