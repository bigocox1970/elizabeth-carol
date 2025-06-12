import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, Trash2, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/utils/api";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostsListProps {
  onEditPost: (postId: string) => void;
  refreshTrigger?: number;
}

const BlogPostsList = ({ onEditPost, refreshTrigger }: BlogPostsListProps) => {
  const { session } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      loadPosts();
    }
  }, [session, refreshTrigger]);

  const loadPosts = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      console.log('Loading blog posts...');
      const response = await fetch(getApiUrl('manage-blog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'get-all'
        }),
      });

      console.log('Blog posts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Blog posts data received:', data);
        setPosts(data.posts || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load blog posts:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!session) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(getApiUrl('manage-blog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          postId: postId
        }),
      });

      if (response.ok) {
        loadPosts();
      } else {
        alert('Failed to delete post.');
      }
    } catch (error) {
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Blog Posts ({posts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No blog posts yet
            </p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditPost(post.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeletePost(post.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {post.published ? (
                      <div className="flex items-center text-green-600">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>Published</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <EyeOff className="w-3 h-3 mr-1" />
                        <span>Draft</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Button 
          onClick={loadPosts}
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

export default BlogPostsList;
