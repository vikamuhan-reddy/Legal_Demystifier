import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isPlaceholder = (val: string | undefined) => 
  !val || val.includes('YOUR_') || val.includes('placeholder') || val.includes('<');

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.warn(
    'Supabase environment variables are missing or using placeholders. Auth will fallback to Demo Mode.'
  );
}

// Create a single supabase client for interacting with your database
// We provide dummy values if env vars are missing to prevent top-level crashes, 
// but we check for configuration in the hooks.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
