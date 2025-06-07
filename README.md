# Welcome to your Lovable project
# Elizabeth Carol Website

This is the website for Elizabeth Carol, a psychic medium and spiritual guide. The website includes features for building an email list, managing a blog with comments, and collecting customer reviews.

## Features

- Email newsletter subscription
- Blog with commenting functionality
- Customer reviews and testimonials
- Admin panel for managing all content

## Environment Variables

The following environment variables need to be set in the Netlify dashboard:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
ADMIN_PASSWORD=your_admin_password
```

To set these variables in Netlify:
1. Go to the Netlify dashboard
2. Navigate to Site settings > Build & deploy > Environment variables
3. Add each variable with its corresponding value

## Local Development

1. Clone the repository
2. Create a `.env` file in the root directory with the environment variables listed above
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch.

## Database Setup

The database is hosted on Supabase. The SQL migrations are in the `supabase/migrations` directory.

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
