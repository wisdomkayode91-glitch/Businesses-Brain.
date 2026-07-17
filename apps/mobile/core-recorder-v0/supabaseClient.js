// Replace these with your actual Supabase project values.
// Find them in: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// For now this is hardcoded for quick local testing.
// Before this goes anywhere near production, move these into environment
// variables and never commit real keys to GitHub.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
