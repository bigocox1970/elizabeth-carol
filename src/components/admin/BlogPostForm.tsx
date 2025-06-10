import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Save, Upload, X, Image, Camera, Sparkles, Loader2, Plus } from "lucide-react";
import { getApiUrl } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

interface BlogPostFormProps {
  editingPost: string | null;
  onPostSaved: () => void;
  onCancelEdit?: () => void;
}

const BlogPostForm = ({ editingPost, onPostSaved, onCancelEdit }: BlogPostFormProps) => {
  const { session } = useAuth();
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
  
  // AI Generation states
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiOutline, setAiOutline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  
  // Image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenMessage, setImageGenMessage] = useState('');

  // Load post data when editing
  useEffect(() => {
    if (editingPost && session) {
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
  }, [editingPost, session]);

  const loadPostData = async (postId: string) => {
    if (!session) return;

    setIsLoading(true);
    try {
      console.log('Loading post data for ID:', postId);
      const response = await fetch(getApiUrl('manage-blog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'get-single',
          postId: postId
        }),
      });

      console.log('Post data response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Post data received:', data);
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
      } else {
        const errorData = await response.json();
        console.error('Failed to load post:', response.status, errorData);
        setBlogMessage('Failed to load post data.');
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
    if (!session) return;

    // Check if image is missing and prompt user
    if (!blogData.image_url && !selectedImage && !imagePreview) {
      const shouldContinue = window.confirm(
        "You haven't added an image to this blog post. Images help engage readers and improve the visual appeal of your content.\n\nWould you like to continue without an image, or would you prefer to add one first?\n\nClick 'OK' to continue without an image, or 'Cancel' to add an image first."
      );
      if (!shouldContinue) {
        setBlogMessage('Please add an image using the upload button or "Generate AI Image" button above.');
        return;
      }
    }
    setIsSubmitting(true);
    setBlogMessage('');
    try {
      // Handle image upload if image selected
      let imageUrl = blogData.image_url;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      const response = await fetch(getApiUrl('manage-blog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          postData: { ...blogData, image_url: imageUrl }
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setBlogMessage('Blog post created successfully!');
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
        } else {
          setBlogData({
            title: '',
            content: '',
            excerpt: '',
            category: 'Spiritual Guidance',
            published: false,
            image_url: ''
          });
          setImagePreview('');
        }
        setSelectedImage(null);
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
    if (!session) return;

    // Check if image is missing and prompt user (only for new posts or if image was removed)
    if (!blogData.image_url && !selectedImage && !imagePreview) {
      const shouldContinue = window.confirm(
        "You haven't added an image to this blog post. Images help engage readers and improve the visual appeal of your content.\n\nWould you like to continue without an image, or would you prefer to add one first?\n\nClick 'OK' to continue without an image, or 'Cancel' to add an image first."
      );
      if (!shouldContinue) {
        setBlogMessage('Please add an image using the upload button or "Generate AI Image" button above.');
        return;
      }
    }
    setIsSubmitting(true);
    setBlogMessage('');
    try {
      // Handle image upload if new image selected
      let imageUrl = blogData.image_url;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      const response = await fetch(getApiUrl('manage-blog'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'update',
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

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width, maintain aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file);
      setSelectedImage(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error('Error handling image:', error);
      setBlogMessage('Failed to process image. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setBlogData(prev => ({ ...prev, image_url: '' }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!session) throw new Error('No session');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(getApiUrl('upload-image'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleAiGeneration = async () => {
    if (!session) return;

    if (!aiTopic.trim()) {
      setAiMessage('Please enter a topic for the blog post.');
      return;
    }

    setIsGenerating(true);
    setAiMessage('');

    try {
      const response = await fetch(getApiUrl('generate-blog-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          topic: aiTopic
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from API:', errorData);
        throw new Error(errorData.message || 'Failed to generate blog post');
      }

      const data = await response.json();
      if (data.success) {
        setAiOutline(data.content);
        setAiMessage('Blog post generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate blog post');
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
      setAiMessage(error.message || 'Failed to generate blog post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!session) return;

    if (!blogData.title.trim()) {
      setImageGenMessage('Please enter a title for the blog post first.');
      return;
    }

    setIsGeneratingImage(true);
    setImageGenMessage('');

    try {
      const response = await fetch(getApiUrl('generate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ prompt: blogData.title })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImagePreview(data.url);
      setBlogData(prev => ({ ...prev, image_url: data.url }));
      setImageGenMessage('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      setImageGenMessage('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading post data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={blogData.title}
                onChange={(e) => setBlogData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter blog post title"
                required
              />
            </div>

            {/* Featured Image Section - Moved above content */}
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-secondary"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageGeneration}
                  disabled={isGeneratingImage}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>Generate AI Image</span>
                </Button>
              </div>
              {imageGenMessage && (
                <p className={`text-sm ${imageGenMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {imageGenMessage}
                </p>
              )}
              {imagePreview && (
                <div className="relative mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={blogData.excerpt}
                onChange={(e) => setBlogData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Enter a brief excerpt"
                className="h-20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content</Label>
                <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Blog Post with AI</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ai-topic">Topic</Label>
                        <Input
                          id="ai-topic"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="Enter a topic for the blog post"
                        />
                      </div>
                      <Button
                        onClick={handleAiGeneration}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate'
                        )}
                      </Button>
                      {aiMessage && (
                        <p className={`text-sm ${aiMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                          {aiMessage}
                        </p>
                      )}
                      {aiOutline && (
                        <div className="mt-4">
                          <Label>Generated Outline</Label>
                          <Textarea
                            value={aiOutline}
                            onChange={(e) => setAiOutline(e.target.value)}
                            className="h-32"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              setBlogData(prev => ({ ...prev, content: aiOutline }));
                              setShowAiDialog(false);
                            }}
                            className="mt-2"
                          >
                            Use This Content
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Textarea
                id="content"
                value={blogData.content}
                onChange={(e) => setBlogData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here"
                className="h-64"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={blogData.category}
                onChange={(e) => setBlogData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={blogData.published}
                onCheckedChange={(checked) => setBlogData(prev => ({ ...prev, published: checked }))}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingPost && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingPost ? 'Update Post' : 'Create Post'}</span>
            </Button>
          </div>

          {blogMessage && (
            <p className={`text-sm ${blogMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {blogMessage}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default BlogPostForm;
