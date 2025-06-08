import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Save } from "lucide-react";

interface BlogPostFormProps {
  password: string;
  editingPost: string | null;
  onPostSaved: () => void;
  onCancelEdit?: () => void;
}

const BlogPostForm = ({ password, editingPost, onPostSaved, onCancelEdit }: BlogPostFormProps) => {
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Spiritual Guidance',
    published: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogMessage, setBlogMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load post data when editing
  useEffect(() => {
    if (editingPost) {
      loadPostData(editingPost);
    } else {
      // Reset form when creating new post
      setBlogData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Spiritual Guidance',
        published: false
      });
      setBlogMessage('');
    }
  }, [editingPost]);

  const loadPostData = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get-single',
          password: password,
          postId: postId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.post) {
          setBlogData({
            title: data.post.title || '',
            content: data.post.content || '',
            excerpt: data.post.excerpt || '',
            category: data.post.category || 'Spiritual Guidance',
            published: data.post.published || false
          });
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      setBlogMessage('Failed to load post data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBlogMessage('');

    try {
      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          password: password,
          postData: blogData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBlogMessage('Blog post created successfully!');
        setBlogData({
          title: '',
          content: '',
          excerpt: '',
          category: 'Spiritual Guidance',
          published: false
        });
        onPostSaved();
      } else {
        setBlogMessage(data.message || 'Failed to create blog post.');
      }
    } catch (error) {
      setBlogMessage('Failed to create blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBlogMessage('');

    try {
      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          password: password,
          postId: editingPost,
          postData: blogData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBlogMessage('Blog post updated successfully!');
        onPostSaved();
      } else {
        setBlogMessage(data.message || 'Failed to update blog post.');
      }
    } catch (error) {
      setBlogMessage('Failed to update blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              value={blogData.title}
              onChange={(e) => setBlogData({...blogData, title: e.target.value})}
              placeholder="e.g., Finding Peace Through Meditation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              value={blogData.excerpt}
              onChange={(e) => setBlogData({...blogData, excerpt: e.target.value})}
              placeholder="A brief summary of your post (will be auto-generated if left empty)"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={blogData.category}
              onChange={(e) => setBlogData({...blogData, category: e.target.value})}
              placeholder="e.g., Spiritual Guidance, Meditation, Healing"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={blogData.content}
              onChange={(e) => setBlogData({...blogData, content: e.target.value})}
              placeholder="Write your blog post content here..."
              rows={10}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={blogData.published}
              onCheckedChange={(checked) => setBlogData({...blogData, published: checked})}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
          
          <div className="flex gap-2">
            {editingPost && onCancelEdit && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-900 to-black hover:from-black hover:to-gray-900 text-white disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : isLoading ? 'Loading...' : editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
          
          {blogMessage && (
            <div className={`p-3 rounded-md ${blogMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <p className="text-sm">{blogMessage}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;
