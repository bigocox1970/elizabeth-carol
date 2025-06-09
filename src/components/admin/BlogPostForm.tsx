import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Save, Upload, X, Image, Camera, Sparkles, Loader2 } from "lucide-react";
import { getApiUrl } from "@/utils/api";

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
          0.8 // 80% quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setBlogMessage('Please select a valid image file.');
        return;
      }

      setBlogMessage('Processing image...');
      
      try {
        // Compress the image
        const compressedFile = await compressImage(file);
        
        // Check compressed file size (should now be much smaller)
        if (compressedFile.size > 5 * 1024 * 1024) {
          setBlogMessage('Image is too large even after compression. Please try a different image.');
          return;
        }

        setSelectedImage(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
        setBlogMessage('');
      } catch (error) {
        setBlogMessage('Error processing image. Please try again.');
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setBlogData({ ...blogData, image_url: '' });
  };

  const uploadImage = async (file: File): Promise<string> => {
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
  };

  const handleAiGeneration = async () => {
    if (!aiTopic.trim()) {
      setAiMessage('Please enter a topic for your blog post.');
      return;
    }

    setIsGenerating(true);
    setAiMessage('');

    try {
      const response = await fetch(getApiUrl('generate-blog-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          topic: aiTopic,
          outline: aiOutline,
          category: blogData.category
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Populate the form with AI-generated content
        setBlogData(prev => ({
          ...prev,
          title: data.title || prev.title,
          content: data.content || prev.content,
          excerpt: data.excerpt || prev.excerpt,
        }));
        
        setShowAiDialog(false);
        setAiTopic('');
        setAiOutline('');
        setAiMessage('');
        setBlogMessage(data.message || 'Blog post generated successfully! You can edit the content before saving.');
      } else {
        setAiMessage(data.message || 'Failed to generate blog post. Please try again.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiMessage('Failed to generate blog post. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!blogData.title && !aiTopic) {
      setImageGenMessage('Please enter a blog title or topic first.');
      return;
    }

    setIsGeneratingImage(true);
    setImageGenMessage('');

    try {
      const response = await fetch(getApiUrl('generate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          title: blogData.title,
          topic: aiTopic,
          category: blogData.category
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Server has already saved the image to Supabase, just use the permanent URL
        setBlogData(prev => ({
          ...prev,
          image_url: data.imageUrl,
        }));
        setImagePreview(data.imageUrl);
        setSelectedImage(null); // Clear any previously selected file
        setImageGenMessage('');
        setBlogMessage(data.message || 'Beautiful AI image generated and saved successfully!');
      } else {
        setImageGenMessage(data.message || 'Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setImageGenMessage('Failed to generate image. Please check your connection and try again.');
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
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Input
                   id="image"
                   type="file"
                   accept="image/*"
                   onChange={handleImageSelect}
                   className="hidden"
                 />
                 <Input
                   id="camera"
                   type="file"
                   accept="image/*"
                   capture="environment"
                   onChange={handleImageSelect}
                   className="hidden"
                 />
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => document.getElementById('camera')?.click()}
                   className="flex items-center justify-center gap-2 h-11"
                 >
                   <Camera className="w-4 h-4" />
                   Take Photo
                 </Button>
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => document.getElementById('image')?.click()}
                   className="flex items-center justify-center gap-2 h-11"
                 >
                   <Upload className="w-4 h-4" />
                   Upload Image
                 </Button>
                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleImageGeneration}
                   disabled={isGeneratingImage || (!blogData.title && !aiTopic)}
                   className="col-span-1 sm:col-span-2 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border-purple-300 text-purple-700 h-11"
                 >
                   {isGeneratingImage ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Generating Image...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-4 h-4 mr-2" />
                       Generate AI Image
                     </>
                   )}
                 </Button>
                 {imagePreview && (
                   <Button
                     type="button"
                     variant="outline"
                     onClick={removeImage}
                     className="col-span-1 sm:col-span-2 text-red-600 border-red-200 hover:bg-red-50 h-11"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Remove Image
                   </Button>
                 )}
               </div>
               {imageGenMessage && (
                 <div className={`p-3 rounded-md ${imageGenMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                   <p className="text-sm">{imageGenMessage}</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <div className="flex gap-2 mb-2">
              <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border-purple-300 text-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Generate Blog Post with AI
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      AI will generate a complete blog post in Elizabeth's authentic voice. Use the separate "Generate AI Image" button to add a spiritual image.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-topic">Topic *</Label>
                      <Input
                        id="ai-topic"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g., The healing power of crystals"
                        disabled={isGenerating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-outline">Brief Outline (Optional)</Label>
                      <Textarea
                        id="ai-outline"
                        value={aiOutline}
                        onChange={(e) => setAiOutline(e.target.value)}
                        placeholder="e.g., Introduction to crystals, their spiritual properties, how to use them for healing..."
                        rows={3}
                        disabled={isGenerating}
                      />
                    </div>
                    {aiMessage && (
                      <div className={`p-3 rounded-md ${aiMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <p className="text-sm">{aiMessage}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAiDialog(false);
                          setAiTopic('');
                          setAiOutline('');
                          setAiMessage('');
                        }}
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAiGeneration}
                        disabled={isGenerating || !aiTopic.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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

