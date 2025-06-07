import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, BookOpen, Star, MessageCircle, Plus } from "lucide-react";

// Import admin components
import LoginForm from "@/components/admin/LoginForm";
import SubscribersList from "@/components/admin/SubscribersList";
import NewsletterForm from "@/components/admin/NewsletterForm";
import AdminTips from "@/components/admin/AdminTips";
import BlogPostForm from "@/components/admin/BlogPostForm";
import BlogPostsList from "@/components/admin/BlogPostsList";
import ReviewsList from "@/components/admin/ReviewsList";
import CommentsList from "@/components/admin/CommentsList";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("subscribers");
  const [editingPost, setEditingPost] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscribers();
    }
  }, [isAuthenticated]);

  const handleLogin = (enteredPassword: string) => {
    // Simple password check
    if (enteredPassword === 'elizabeth2024') {
      setIsAuthenticated(true);
      setPassword(enteredPassword);
    } else {
      alert('Incorrect password');
    }
  };

  const loadSubscribers = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Elizabeth Carol Admin</h1>
            <Button 
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
            >
              Logout
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full">
              <TabsTrigger value="subscribers" onClick={() => setActiveTab("subscribers")}>
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Subscribers</span>
                <span className="sm:hidden">Subs</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" onClick={() => setActiveTab("newsletter")}>
                <Mail className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Newsletter</span>
                <span className="sm:hidden">Email</span>
              </TabsTrigger>
              <TabsTrigger value="blog" onClick={() => setActiveTab("blog")}>
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Blog</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" onClick={() => setActiveTab("reviews")}>
                <Star className="w-4 h-4 mr-2" />
                <span>Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="comments" onClick={() => setActiveTab("comments")}>
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Comments</span>
                <span className="sm:hidden">Cmts</span>
              </TabsTrigger>
            </TabsList>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers" className="space-y-6">
              <SubscribersList password={password} />
            </TabsContent>

            {/* Newsletter Tab */}
            <TabsContent value="newsletter" className="space-y-6">
              <NewsletterForm password={password} subscriberCount={subscribers.length} />
              <AdminTips />
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <BlogPostForm 
                  password={password} 
                  editingPost={editingPost} 
                  onPostSaved={() => {
                    setEditingPost(null);
                  }} 
                />
                <BlogPostsList 
                  password={password} 
                  onEditPost={(postId) => {
                    setEditingPost(postId);
                  }} 
                />
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <ReviewsList password={password} />
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-6">
              <CommentsList password={password} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
