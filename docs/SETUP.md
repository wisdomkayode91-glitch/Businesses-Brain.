# GitHub Setup
# 1. Create new repo "business-brain" (private)
# 2. Push folder structure as first commit

# Branch protection - even solo
# Go to Settings → Branches → Add rule
# Branch name pattern: main
# ✓ Require a pull request before merging
# ✓ Require approvals (1)
# ✓ Dismiss stale pull request approvals when new commits are pushed
# ✓ Require status checks to pass before merging

# .gitignore contents:
node_modules/
.env
.env.local
.env.*.local
.DS_Store
dist/
build/
*.log
.cache/
.vscode/
.idea/
coverage/
.nyc_output/

# Supabase Setup
# 1. Create new project
# 2. Note: PROJECT_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Run migration - copy and paste this in SQL editor:

-- Run supabase/migrations/0001_core_schema.sql
-- Or execute directly:
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  type TEXT CHECK (type IN ('sale', 'purchase', 'adjustment')),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE guardian_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  data JSONB,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies - CRITICAL: Write these before any app code
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_events ENABLE ROW LEVEL SECURITY;

-- Example policy structure - CUSTOMIZE THESE:
-- CREATE POLICY "Users can view their own business"
--   ON businesses FOR SELECT
--   USING (id IN (SELECT business_id FROM users WHERE id = auth.uid()));

-- CREATE POLICY "Users can manage their business data"
--   ON items FOR ALL
--   USING (business_id IN (SELECT business_id FROM users WHERE id = auth.uid()));

-- Enable Realtime for guardian_events
ALTER TABLE guardian_events REPLICA IDENTITY FULL;

-- 4. Auth setup
-- Go to Authentication → Providers
-- Enable Email or Phone (phone recommended for traders)
-- Configure redirect URLs

# Local Environment
# .env file:
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key

# Optional - for running migrations via CLI:
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# First Milestone Test - Run this query to verify RLS:
-- Create test business A and B
-- Insert item into business A
-- Try to query from business B (should return nothing)
-- Confirm RLS blocks cross-business data access
