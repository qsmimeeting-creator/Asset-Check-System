import { createClient } from '@supabase/supabase-js';

// Using environment variables for Supabase integration.
// To use a real database, users must configure these in the AI Studio Settings.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are not provided, we will fallback to local storage / mock data 
// so the preview remains fully functional.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
