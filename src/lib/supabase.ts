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
// If they're undefined, Supabase will throw a clear error
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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

// User content functions
export const getUserContent = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('user_content')
    .select('*')
    .eq('user_id', user.user.id);

  return { data, error };
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
