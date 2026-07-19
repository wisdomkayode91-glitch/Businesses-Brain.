// LedgerMind — Supabase connection
// These are your real project values — already filled in.
const SUPABASE_URL = "https://qrsdwopokhqnjuskutoq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cwPnwoPH1GWNkMUzrXxJ9g_0Kexbr9e";

let supabaseClient;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.warn('Supabase not connected yet — check your URL and key are correct.');
}
