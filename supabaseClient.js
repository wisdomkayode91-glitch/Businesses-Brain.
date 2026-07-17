// supabaseClient.js
// Supabase client initialization with environment variables

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Initialize the Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export the client for use throughout the application
export default supabaseClient;
