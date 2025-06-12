# Welcome to your Lovable project
# Elizabeth Carol Website

This is the website for Elizabeth Carol, a psychic medium and spiritual guide. The website includes features for building an email list, managing a blog with comments, and collecting customer reviews.

## Features

- Email newsletter subscription
- Blog with commenting functionality
- Customer reviews and testimonials
- User authentication system
- User profile management
- Admin panel for managing all content
- **AI Blog Post Generation** - Generate blog posts using OpenAI's GPT-3.5

### AI Blog Post Generation

The admin panel now includes an AI-powered blog post generator that allows Elizabeth to:

- Enter a topic or brief outline
- Generate a complete blog post in her authentic 77-year-old British voice
- **Automatically generate a beautiful spiritual image** to accompany the post
- Edit and customise both the content and image before publishing
- Save time while maintaining quality and personal touch

The AI is specifically trained to write as Elizabeth Carol would - a wise, 77-year-old clairvoyant with proper British English grammar and expressions. Generated posts include:
- Compelling titles (British English)
- Brief excerpts for previews (British English)
- Full blog content (800-1200 words, British English throughout)
- Practical spiritual advice drawn from decades of experience
- Personal, slightly formal but warm tone befitting her age and wisdom
- **Beautiful, calming spiritual images** created with DALL-E 3

## Environment Variables

The following environment variables need to be set in the Netlify dashboard:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
ADMIN_PASSWORD=your_admin_password
OPENAI_API_KEY=your_openai_api_key
```

To set these variables in Netlify:
1. Go to the Netlify dashboard
2. Navigate to Site settings > Build & deploy > Environment variables
3. Add each variable with its corresponding value

### Setting up OpenAI API Key

To enable the AI blog post and image generation feature:

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key from your OpenAI dashboard
3. Add the `OPENAI_API_KEY` environment variable with your API key
4. The AI feature will use GPT-3.5-turbo for blog content and DALL-E 3 for image generation

**Note**: The AI generation feature requires the OpenAI API key to be configured. Without it, the feature will show an error message to configure the API key. The same API key is used for both text generation (blog posts) and image generation.

## Local Development

1. Clone the repository
2. Create a `.env` file in the root directory with the environment variables listed above
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch.

## Database Setup

The database is hosted on Supabase. The SQL migrations are in the `supabase/migrations` directory.

## User Authentication

The website includes a user authentication system powered by Supabase Auth. Users can:

- Register for an account
- Log in to their account
- View and manage their profile
- Edit or delete their comments and reviews
- Associate their newsletter subscription with their account

To set up authentication:

1. Create a Supabase project and enable Email authentication
2. Run the migrations in the `supabase/migrations` directory
3. Set the Supabase URL and anon key in your environment variables

## Project info

**URL**: https://lovable.dev/projects/1afd297e-bcf2-4032-a859-b34f451d18b5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1afd297e-bcf2-4032-a859-b34f451d18b5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1afd297e-bcf2-4032-a859-b34f451d18b5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

# Elizabeth Carol - Spiritual Guidance Website

A beautiful, modern website for Elizabeth Carol, a psychic medium and spiritual guide based in Oxford, UK.

## Features

### 🌟 Core Features
- **Responsive Design**: Beautiful, mobile-first design that works perfectly on all devices
- **Dark/Light Mode**: Automatic theme switching based on user preference
- **Contact Forms**: Integrated contact and booking forms with email notifications
- **Blog System**: Full-featured blog with admin panel for content management
- **AI-Powered Content**: Advanced AI integration for blog post and image generation
- **Image Management**: Automatic image optimization and cloud storage

### 🤖 AI Features
- **Blog Post Generation**: AI generates authentic blog content in Elizabeth's voice
- **Image Generation**: AI creates beautiful spiritual images using DALL-E
- **Separate Workflows**: Independent blog and image generation for optimal performance
- **British English**: All AI content uses proper British English and terminology

### 📱 User Experience
- **Fast Loading**: Optimized performance with lazy loading and image compression
- **SEO Optimized**: Proper meta tags, structured data, and search engine optimization
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation
- **Professional Design**: Elegant purple and gold color scheme reflecting spiritual themes

### 🔧 Technical Features
- **Modern Stack**: Built with React, TypeScript, and Tailwind CSS
- **Serverless Functions**: Netlify Functions for backend operations
- **Database**: Supabase for reliable data storage
- **Image Storage**: Supabase Storage for optimized image delivery
- **Email Integration**: Nodemailer for contact form submissions
- **Admin Panel**: Secure admin interface for content management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/elizabeth-carol.git
cd elizabeth-carol
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_admin_password
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The site is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `dist`
4. Add all environment variables in Netlify's dashboard
5. Deploy!

## AI Features Setup

### OpenAI Integration
The AI features require an OpenAI API key with access to:
- GPT-4 or GPT-3.5-turbo for text generation
- DALL-E 3 for image generation

Add your OpenAI API key to the `OPENAI_API_KEY` environment variable.

### Blog Post Generation
- Generates authentic content in Elizabeth's voice
- Supports custom topics and outlines
- Maintains consistent British English and spiritual tone
- Separate from image generation for faster performance

### Image Generation
- Creates beautiful spiritual artwork using DALL-E 3
- Category-specific prompts for relevant imagery
- Automatic upload to Supabase storage
- Permanent URLs for reliable blog post display

## Admin Panel

Access the admin panel at `/admin` with your admin password to:
- Create and edit blog posts
- Generate AI content and images
- Manage published/draft status
- Upload and manage images

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

<!-- Build cache refresh: 2024-12-19 -->
