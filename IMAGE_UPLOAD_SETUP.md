# Image Upload Setup Instructions

## What's Been Added

I've implemented image upload functionality for blog posts with the following features:

### Frontend Changes:
1. **Blog Post Form** (`src/components/admin/BlogPostForm.tsx`):
   - Added image upload field with preview
   - File validation (size < 5MB, image types only)
   - Image removal functionality
   - Upload progress handling

2. **Blog Display** (`src/pages/Blog.tsx`):
   - Shows featured images on blog cards
   - Hover effects on images

3. **Blog Post Page** (`src/pages/BlogPost.tsx`):
   - Displays featured image above content
   - Responsive image sizing

### Backend Changes:
1. **Image Upload Function** (`netlify/functions/upload-image.js`):
   - Handles multipart form data
   - Uploads to Supabase Storage
   - Returns public URL
   - Admin authentication required

2. **Blog Management Function** (`netlify/functions/manage-blog.js`):
   - Updated to handle `image_url` field
   - Returns image URLs in all blog operations

## Setup Required

### 1. Supabase Storage Bucket
You need to create a storage bucket in your Supabase project:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `blog-images`
3. Set bucket to public (so images can be viewed by anyone)
4. Configure RLS policies if needed

### 2. Database Schema Update
Add the `image_url` column to your `blog_posts` table:

```sql
ALTER TABLE blog_posts 
ADD COLUMN image_url TEXT;
```

### 3. Environment Variables
Make sure you have these in your Netlify environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for storage upload)
- `ADMIN_PASSWORD`

## How It Works

1. **Upload Process**:
   - User selects image in admin form
   - Image is validated (size, type)
   - Preview is shown immediately
   - On form submit, image uploads to Supabase Storage
   - Blog post saves with the image URL

2. **Display Process**:
   - Blog cards show images if available
   - Individual blog posts display featured image
   - Images are responsive and optimized

## File Types Supported
- PNG, JPG, GIF
- Maximum size: 5MB
- Automatically generates unique filenames

## Security
- Only admin users can upload images
- File type validation
- File size limits
- Secure Supabase Storage integration

Your mum can now easily add pictures to blog posts by:
1. Going to the admin panel
2. Creating or editing a blog post
3. Clicking "Upload Image" 
4. Taking a photo or selecting from gallery
5. Seeing the preview immediately
6. Publishing the post with the image

The images will appear beautifully on both the blog listing page and individual blog post pages. 