import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in environment variables.');
  
  // In production, this will show a clear error
  // In development, we can use the values from .env file
  if (import.meta.env.PROD) {
    // Display a more user-friendly error in the console
    console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Netlify environment variables.');
    console.error('And make sure they are properly mapped to VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in netlify.toml.');
  }
}

// Create the Supabase client with available credentials
// If environment variables are missing, use a placeholder URL that will be replaced in production
const fallbackUrl = 'https://xyzplaceholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24ifQ.placeholder';

// Function to validate URL
const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

// Use the URL only if it's valid
const finalUrl = supabaseUrl && isValidUrl(supabaseUrl) ? supabaseUrl : fallbackUrl;
const finalKey = supabaseAnonKey || fallbackKey;

console.log('Supabase URL validation:', {
  providedUrl: supabaseUrl,
  isValid: supabaseUrl ? isValidUrl(supabaseUrl) : false,
  usingUrl: finalUrl
});

export const supabase = createClient(finalUrl, finalKey);

// Auth helper functions
export const signUp = async (email: string, password: string, metadata: Record<string, unknown> = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (event: string, session: unknown) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// User content functions - now querying original tables directly
export const getUserContent = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  // Get user's comments with blog post titles
  const { data: comments, error: commentsError } = await supabase
    .from('blog_comments')
    .select(`
      id,
      content,
      post_id,
      approved,
      created_at,
      blog_posts(title)
    `)
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (commentsError) return { data: null, error: commentsError };

  // Get user's reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, content, rating, service, approved, created_at')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (reviewsError) return { data: null, error: reviewsError };

  // Combine and format the data
  const combinedData = [
    ...(comments || []).map(comment => ({
      id: comment.id,
      content_type: 'comment' as const,
      title: (comment as any).blog_posts?.title || 'Blog Comment',
      content: comment.content,
      metadata: {
        post_id: comment.post_id,
        approved: comment.approved
      },
      created_at: comment.created_at,
      approved: comment.approved
    })),
    ...(reviews || []).map(review => ({
      id: review.id,
      content_type: 'review' as const,
      title: `Review: ${(review as any).service || 'General'}`,
      content: review.content,
      metadata: {
        rating: (review as any).rating,
        service: (review as any).service,
        approved: review.approved
      },
      created_at: review.created_at,
      approved: review.approved
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { data: combinedData, error: null };
};

export const getUserComments = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('user_id', user.user.id);

  return { data, error };
};

export const getUserReviews = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.user.id);

  return { data, error };
};

export const updateComment = async (id: number, content: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('blog_comments')
    .update({ content })
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select();

  return { data, error };
};

export const updateReview = async (id: number, content: string, rating?: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const updateData: Record<string, unknown> = { content };
  if (rating) updateData.rating = rating;

  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.user.id)
    .select();

  return { data, error };
};

export const deleteComment = async (id: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);

  return { data, error };
};

export const deleteReview = async (id: number) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', user.user.id);

  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // First check the user's metadata
    if (user.user_metadata?.is_admin === true) {
      return true;
    }

    // If not in metadata, check using the database function
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: user.id });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
};
