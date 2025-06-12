import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here' || !supabaseUrl.startsWith('http')) {
  console.error('VITE_SUPABASE_URL is not properly configured. Please set it to your actual Supabase project URL.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('VITE_SUPABASE_KEY is not properly configured. Please set it to your actual Supabase anon key.');
}

// Use fallback values to prevent the app from crashing
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = (supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here') ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(validUrl, validKey);