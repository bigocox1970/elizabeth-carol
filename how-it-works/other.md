# Other Features & Utilities

## Reviews
- Users can leave reviews for services
- Managed in `src/pages/AddReview.tsx`, `src/pages/UserProfile.tsx`, and `netlify/functions/manage-reviews.js`

## Comments
- Users can comment on blog posts
- Managed in `src/pages/BlogPost.tsx`, `src/pages/UserProfile.tsx`, and `netlify/functions/manage-comments.js`

## Newsletter
- Users can subscribe via the frontend
- Admin can send newsletters via `netlify/functions/send-newsletter.js`

## AI Tools
- AI-powered blog post and image generation via `netlify/functions/generate-blog-post.js` and `generate-image.js`

## See Also
- [functions.md](./functions.md) for backend logic
- [frontend.md](./frontend.md) for UI 