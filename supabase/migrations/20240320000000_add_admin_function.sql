-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user exists in the admin_users table
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = user_id
  );
END;
$$;

-- Create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to view the admin_users table
CREATE POLICY "Allow admins to view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.admin_users
    )
  );

-- Create policy to allow only service role to insert/update/delete
CREATE POLICY "Allow service role to manage admin_users"
  ON public.admin_users
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 