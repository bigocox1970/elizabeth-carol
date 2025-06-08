// Script to apply the fix for multiple reviews issue
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get Supabase credentials from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
const sql = fs.readFileSync('fix_multiple_reviews.sql', 'utf8');

async function applyFix() {
  try {
    console.log('Applying fix for multiple reviews issue...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('pgexecute', { sql });
    
    if (error) {
      console.error('Error applying fix:', error);
      process.exit(1);
    }
    
    console.log('Fix applied successfully!');
    console.log('You should now be able to submit multiple reviews.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applyFix();
