# Elizabeth Carol Website - TODO List

## GOAL
Complete business management system for Elizabeth's clairvoyant business:
- Email list management + newsletters
- Customer reviews/testimonials  
- Blog with comments
- ALL managed from admin panel

## DATABASE STATUS ✅
- [x] Supabase project created
- [x] `subscribers` table created
- [x] `blog_posts` table created  
- [x] `blog_comments` table created
- [x] `reviews` table created
- [x] All tables have proper RLS policies

## CURRENT ISSUES 🚨
- [ ] **CRITICAL: Newsletter signup gets 500 error** - Supabase package not working in functions
- [ ] Contact form needs to save to database
- [ ] Admin panel shows no subscribers (not connected to database)

## PHASE 1: FIX CORE FUNCTIONALITY 🔥
### Newsletter & Contact Forms
- [x] Fix `add-subscriber.js` - use Supabase REST API instead of package
- [x] Fix `contact.js` - save to subscribers table via REST API
- [x] Fix `get-subscribers.js` - read from Supabase via REST API
- [ ] Test newsletter signup works + shows in admin
- [ ] Test contact form works + adds to subscriber list

### Admin Panel - Subscriber Management
- [ ] Admin panel loads real subscribers from database
- [ ] Newsletter sending works (existing `send-newsletter.js`)
- [ ] Subscriber count displays correctly
- [ ] Can refresh subscriber list

## PHASE 2: REVIEWS SYSTEM 📝
### Review Collection
- [ ] Create review submission form component
- [ ] Add review form to website (after reading page?)
- [ ] Create `submit-review.js` function - save to reviews table
- [ ] Test review submission works

### Review Management  
- [ ] Add reviews section to admin panel
- [ ] Show pending reviews (unapproved)
- [ ] Admin can approve/reject reviews
- [ ] Admin can feature reviews
- [ ] Update `manage-reviews.js` to use Supabase REST API

### Review Display
- [ ] Update testimonials page to show approved reviews from database
- [ ] Show featured reviews on homepage
- [ ] Add star ratings display

## PHASE 3: BLOG SYSTEM ✍️
### Blog Management
- [ ] Fix `manage-blog.js` to use Supabase REST API
- [ ] Admin can create/edit/delete blog posts
- [ ] Admin can publish/unpublish posts
- [ ] Blog post list in admin panel

### Blog Display
- [ ] Blog page loads posts from database
- [ ] Individual blog post pages load from database
- [ ] Show post categories and dates

### Comments System
- [ ] Add comment form to blog posts
- [ ] Create `submit-comment.js` function
- [ ] Comments save to blog_comments table
- [ ] Admin can approve/reject comments
- [ ] Approved comments show on blog posts

## PHASE 4: FINAL POLISH ✨
### Admin Panel Enhancements
- [ ] Dashboard overview (subscriber count, pending reviews, etc)
- [ ] Better navigation between sections
- [ ] Success/error message improvements

### Email System
- [ ] Test newsletter sending works with real subscribers
- [ ] Email templates look good
- [ ] Unsubscribe functionality

### Security & Performance
- [ ] Remove any hardcoded passwords/keys
- [ ] Add rate limiting to forms
- [ ] Optimize database queries

## TECHNICAL APPROACH 🛠️
**Using Supabase REST API instead of packages:**
```javascript
// Instead of supabase-js package, use fetch:
const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

## SUCCESS CRITERIA ✅
- [x] Database tables created
- [ ] Newsletter signup works without errors
- [ ] Admin panel shows real subscriber data
- [ ] Elizabeth can send newsletters
- [ ] Customers can leave reviews
- [ ] Elizabeth can approve reviews
- [ ] Reviews show on testimonials page
- [ ] Elizabeth can write blog posts
- [ ] Visitors can comment on blog posts
- [ ] Elizabeth can moderate comments

## CURRENT PRIORITY 🎯
**FIX THE 500 ERROR ON NEWSLETTER SIGNUP** - everything else depends on this working. 