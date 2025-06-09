import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, MessageCircle, Star } from "lucide-react";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get-published' }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading spiritual insights...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-celestial">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Spiritual Insights & Guidance
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome to my journal of spiritual exploration, where I share insights from years of connecting 
              with spirit and helping others find their path to healing and understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  New Insights Coming Soon
                </h3>
                <p className="text-muted-foreground mb-8">
                  Elizabeth is preparing beautiful spiritual content to share with you. 
                  Subscribe to our newsletter to be notified when new posts are published.
                </p>
                <Link to="/contact">
                  <Button className="bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white">
                    Subscribe for Updates
              </Button>
                </Link>
          </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="block">
                    <Card className="flex flex-col h-96 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer">
                      {post.image_url && (
                        <div className="overflow-hidden rounded-t-lg" style={{ height: "192px" }}>
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="flex-none">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 justify-between">
                        <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="w-3 h-3 mr-1" />
                              {post.author}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {getReadTime(post.content)}
                            </div>
                          </div>
                          {post.reviews && post.reviews.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground mb-4">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {post.reviews.filter(r => r.approved).length} comments
                              {post.reviews.filter(r => r.approved).length > 0 && (
                                <>
                                  <Star className="w-3 h-3 ml-2 mr-1 fill-yellow-400 text-yellow-400" />
                                  {(post.reviews.filter(r => r.approved).reduce((sum, r) => sum + r.rating, 0) / post.reviews.filter(r => r.approved).length).toFixed(1)}
                                </>
                              )}
                            </div>
                          )}
                          <div className="flex items-center text-primary group-hover:text-primary/80 transition-colors mt-auto">
                            <span className="text-sm font-medium">Read More</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
