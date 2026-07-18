// ── Supabase Client Configuration ──────────────────────
// Replace with your real Supabase project values.
// Find them in: Supabase Dashboard → Project Settings → API

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// ── Validate configuration ─────────────────────────────
if (SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" || 
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY") {
  console.warn(
    '⚠️ Supabase credentials not configured! ' +
    'Please update SUPABASE_URL and SUPABASE_ANON_KEY in supabaseClient.js'
  );
}

// ── Create client ──────────────────────────────────────
// Never commit real keys to a public GitHub repo. 
// Move these into environment variables before this goes 
// anywhere near real users.

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// ── Helper functions for common operations ─────────────

/**
 * Check if the client is properly configured
 * @returns {boolean} True if credentials are set
 */
function isSupabaseConfigured() {
  return SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" && 
         SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}

/**
 * Get the current business ID from localStorage or session
 * @returns {string|null} The business ID or null if not found
 */
function getCurrentBusinessId() {
  try {
    // First check sessionStorage (set during login/onboarding)
    const sessionId = sessionStorage.getItem('ledgermind_business_id');
    if (sessionId) return sessionId;
    
    // Fallback to localStorage (set during onboarding)
    const setupData = JSON.parse(localStorage.getItem('ledgermind_setup'));
    if (setupData && setupData.businessId) return setupData.businessId;
    
    return null;
  } catch (e) {
    console.warn('Could not get business ID:', e);
    return null;
  }
}

/**
 * Set the current business ID
 * @param {string} businessId - The business UUID
 */
function setCurrentBusinessId(businessId) {
  try {
    sessionStorage.setItem('ledgermind_business_id', businessId);
  } catch (e) {
    console.warn('Could not set business ID:', e);
  }
}

/**
 * Test the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured');
    return false;
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('businesses')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (e) {
    console.error('Connection test error:', e);
    return false;
  }
}

// ── Export for use in other files ──────────────────────
// The main client is available as `supabaseClient` in the global scope
// Helper functions are also available

console.log('📦 Supabase client initialized');
console.log(`🔗 URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);
console.log(`✅ Configured: ${isSupabaseConfigured() ? 'Yes' : 'No'}`);

// Run connection test if configured
if (isSupabaseConfigured()) {
  testConnection();
}
