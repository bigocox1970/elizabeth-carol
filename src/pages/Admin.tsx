import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, BookOpen, Star, MessageCircle, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/supabase";

// Import admin components
import SubscribersList from "@/components/admin/SubscribersList";
import NewsletterForm from "@/components/admin/NewsletterForm";
import AdminTips from "@/components/admin/AdminTips";
import BlogPostForm from "@/components/admin/BlogPostForm";
import BlogPostsList from "@/components/admin/BlogPostsList";
import ReviewsList from "@/components/admin/ReviewsList";
import CommentsList from "@/components/admin/CommentsList";
import { getApiUrl } from "@/utils/api";

const Admin = () => {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("subscribers");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  
  // Clear editing post when switching to blog tab
  useEffect(() => {
    if (activeTab === "blog") {
      setEditingPost(null);
    }
  }, [activeTab]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user || !session) {
        console.log('No user or session found, redirecting to auth');
        navigate('/auth?redirect=/admin');
        return;
      }

      try {
        console.log('Checking admin status for user:', user.id);
        const response = await fetch(getApiUrl('verify-admin'), {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        const data = await response.json();
        console.log('Admin verification response:', data);
        
        if (!response.ok || !data.isAdmin) {
          console.error('Admin verification failed:', {
            status: response.status,
            statusText: response.statusText,
            data
          });
          setError('Admin verification failed. Please contact support.');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        setLoading(false);
        loadSubscribers();
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('An error occurred while verifying admin status.');
        navigate('/');
      }
    };

    checkAdmin();
  }, [user, session, navigate]);

  const loadSubscribers = async () => {
    if (!session) return;

    try {
      const response = await fetch(getApiUrl('get-subscribers'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
          {error && (
            <p className="text-red-500 mt-4">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Elizabeth Carol Admin</h1>
            <Button 
              onClick={() => signOut()}
              variant="outline"
            >
              Logout
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 w-full h-auto p-2">
              <TabsTrigger 
                value="subscribers" 
                onClick={() => setActiveTab("subscribers")} 
                className="flex items-center justify-center gap-2 h-11 min-w-0 flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Subscribers</span>
                <span className="sm:hidden">Subs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="newsletter" 
                onClick={() => setActiveTab("newsletter")} 
                className="flex items-center justify-center gap-2 h-11 min-w-0 flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Newsletter</span>
                <span className="sm:hidden">Email</span>
              </TabsTrigger>
              <TabsTrigger 
                value="blog" 
                onClick={() => setActiveTab("blog")} 
                className="flex items-center justify-center gap-2 h-11 min-w-0 flex-1 sm:flex-none sm:min-w-[100px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Blog</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                onClick={() => setActiveTab("reviews")} 
                className="flex items-center justify-center gap-2 h-11 min-w-0 flex-1 sm:flex-none sm:min-w-[110px]"
              >
                <Star className="w-4 h-4" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                onClick={() => setActiveTab("comments")} 
                className="flex items-center justify-center gap-2 h-11 min-w-0 flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Comments</span>
                <span className="sm:hidden">Cmts</span>
              </TabsTrigger>
            </TabsList>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers" className="space-y-6">
              <SubscribersList />
            </TabsContent>

            {/* Newsletter Tab */}
            <TabsContent value="newsletter" className="space-y-6">
              <NewsletterForm subscriberCount={subscribers.length} />
              <AdminTips />
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog" className="space-y-6">
              <div className="flex justify-end mb-2">
                <Button 
                  onClick={() => setEditingPost(null)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Post</span>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <BlogPostForm 
                  editingPost={editingPost} 
                  onPostSaved={() => {
                    setEditingPost(null);
                    setRefreshTrigger(prev => prev + 1); // Trigger refresh
                  }}
                  onCancelEdit={() => {
                    setEditingPost(null);
                  }}
                />
                <BlogPostsList 
                  onEditPost={(postId) => {
                    setEditingPost(postId);
                  }}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <ReviewsList />
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-6">
              <CommentsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
