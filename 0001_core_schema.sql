-- BUSINESS BRAIN — CORE SCHEMA (v1)
-- Implements the Universal Core from Business-Brain-Core-Data-Model.md
-- Archetype-specific data lives in `attributes` jsonb columns, never as new tables at this layer.

create extension if not exists "uuid-ossp";

-- ── Business ────────────────────────────────────────────────
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  archetype_type text not null default 'inventory_retail',
  owner_user_id uuid,
  phone text,
  address text,
  currency text default 'NGN',
  language text default 'en',
  timezone text default 'Africa/Lagos',
  compliance_profile jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ── Users (staff/owner) ─────────────────────────────────────
create table app_users (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  auth_user_id uuid references auth.users(id),
  name text not null,
  phone text,
  role text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at timestamptz default now()
);

-- ── Customers ───────────────────────────────────────────────
create table customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  last_interaction_date timestamptz,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ── Suppliers ───────────────────────────────────────────────
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  reliability_score numeric default 100,
  created_at timestamptz default now()
);

-- ── Items (products / rooms / services / project slots) ─────
create table items (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  category text,
  unit_price numeric(12,2) default 0,
  cost_price numeric(12,2) default 0,
  tracks_inventory boolean default true,
  stock_quantity numeric default 0,
  reorder_point numeric,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ── Transactions ────────────────────────────────────────────
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id),
  user_id uuid references app_users(id),
  type text not null default 'sale' check (type in ('sale','booking','invoice','claim')),
  status text not null default 'paid' check (status in ('paid','partial','owed','overdue')),
  total_amount numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  amount_owed numeric(12,2) not null default 0,
  due_date date,
  channel text default 'in_house',
  created_at timestamptz default now()
);

create table transaction_line_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references transactions(id) on delete cascade,
  item_id uuid references items(id),
  quantity numeric not null default 1,
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) not null
);

-- ── Payments ────────────────────────────────────────────────
create table payments (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references transactions(id) on delete cascade,
  amount numeric(12,2) not null,
  method text check (method in ('cash','pos','transfer','paystack','flutterwave')),
  paid_at timestamptz default now()
);

-- ── Ledger entries (generalized debt: customer debt, HMO claims, school fees) ─
create table ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id),
  linked_transaction_id uuid references transactions(id),
  amount_owed numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  status text default 'current' check (status in ('current','overdue','escalated','resolved')),
  escalation_stage int default 0,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Expenses ────────────────────────────────────────────────
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  category text,
  amount numeric(12,2) not null,
  linked_to text,
  occurred_on date default current_date,
  created_at timestamptz default now()
);

-- ── Inventory movements ─────────────────────────────────────
create table inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  item_id uuid references items(id),
  type text not null check (type in ('sale','restock','waste','adjustment','transfer')),
  quantity numeric not null,
  reason text,
  user_id uuid references app_users(id),
  created_at timestamptz default now()
);

-- ── Appointments / bookings ─────────────────────────────────
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id),
  item_id uuid references items(id),
  start_time timestamptz not null,
  end_time timestamptz,
  status text default 'booked' check (status in ('booked','confirmed','no_show','completed','cancelled')),
  deposit_amount numeric(12,2) default 0,
  reminder_sent_at timestamptz,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ── Compliance items ─────────────────────────────────────────
create table compliance_items (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  license_type text not null,
  issue_date date,
  expiry_date date,
  status text default 'active' check (status in ('active','expiring_soon','expired')),
  created_at timestamptz default now()
);

-- ── Guardian events (the alert log the Daily Briefing reads from) ──
create table guardian_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  type text not null,
  message text not null,
  severity text default 'info' check (severity in ('info','caution','critical')),
  linked_entity_type text,
  linked_entity_id uuid,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- ── Row Level Security (every table scoped to the owning business) ──
alter table businesses enable row level security;
alter table app_users enable row level security;
alter table customers enable row level security;
alter table suppliers enable row level security;
alter table items enable row level security;
alter table transactions enable row level security;
alter table transaction_line_items enable row level security;
alter table payments enable row level security;
alter table ledger_entries enable row level security;
alter table expenses enable row level security;
alter table inventory_movements enable row level security;
alter table appointments enable row level security;
alter table compliance_items enable row level security;
alter table guardian_events enable row level security;

-- Example policy pattern (repeat per table, adjust join path as needed):
-- create policy "business_isolation" on customers
--   for all using (
--     business_id in (select business_id from app_users where auth_user_id = auth.uid())
--   );
-- NOTE: write the actual policies for every table above before going live —
-- this file intentionally leaves them as a documented next task, not guessed at.
