import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, Save, Upload, X, Image } from "lucide-react";

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
    published: false,
    image_url: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
        published: false,
        image_url: ''
      });
      setSelectedImage(null);
      setImagePreview('');
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
            published: data.post.published || false,
            image_url: data.post.image_url || ''
          });
          setImagePreview(data.post.image_url || '');
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
      // Handle image upload if image selected
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          password: password,
          postData: { ...blogData, image_url: imageUrl }
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
          published: false,
          image_url: ''
        });
        setSelectedImage(null);
        setImagePreview('');
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
      // Handle image upload if new image selected
      let imageUrl = blogData.image_url;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const response = await fetch('/.netlify/functions/manage-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          password: password,
          postId: editingPost,
          postData: { ...blogData, image_url: imageUrl }
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setBlogMessage('Image size must be less than 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setBlogMessage('Please select a valid image file.');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setBlogMessage('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setBlogData({ ...blogData, image_url: '' });
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('password', password);

      const response = await fetch('/.netlify/functions/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      throw new Error('Failed to upload image');
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
            <Label htmlFor="image">Featured Image (Optional)</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Click to upload an image, or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removeImage}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
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
