// Supabase client configuration
// Replace these values with your own Supabase project credentials

const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize the Supabase client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Make the client available globally
window.supabaseClient = supabaseClient;

// Optional: Log connection status (remove in production)
console.log('Supabase client initialized');
