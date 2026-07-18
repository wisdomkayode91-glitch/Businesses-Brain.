-- LEDGERMIND — CORE SCHEMA (v1)
-- This migration creates all tables needed for LedgerMind
-- Run this in your Supabase SQL editor before using the app

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================
-- CORE BUSINESS TABLES
-- ============================================================

-- Businesses table - each business is a separate tenant
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  archetype_type text not null default 'inventory_retail',
  owner_user_id uuid,
  phone text,
  address text,
  currency text default 'NGN',
  language text default 'en',
  compliance_profile jsonb default '{}'::jsonb,
  discovery_visible boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- App users - staff members of each business
create table app_users (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  auth_user_id uuid references auth.users(id),
  name text not null,
  phone text,
  role text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CUSTOMERS & SUPPLIERS
-- ============================================================

-- Customers - people who buy from you
create table customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  last_interaction_date timestamptz,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Suppliers - people you buy from
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  reliability_score numeric default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- INVENTORY
-- ============================================================

-- Items - products or services you sell
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
  photo_url text,
  attributes jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory movements - track stock changes
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

-- ============================================================
-- TRANSACTIONS & PAYMENTS
-- ============================================================

-- Transactions - sales, bookings, invoices, claims
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transaction line items - individual items in a transaction
create table transaction_line_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references transactions(id) on delete cascade,
  item_id uuid references items(id),
  quantity numeric not null default 1,
  unit_price numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamptz default now()
);

-- Payments - individual payments received
create table payments (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references transactions(id) on delete cascade,
  amount numeric(12,2) not null,
  method text check (method in ('cash','pos','transfer','paystack','flutterwave')),
  paid_at timestamptz default now()
);

-- ============================================================
-- LEDGER & DEBT TRACKING
-- ============================================================

-- Ledger entries - track debts and outstanding balances
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

-- ============================================================
-- EXPENSES
-- ============================================================

-- Expenses - track business spending
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  category text,
  amount numeric(12,2) not null,
  linked_to text,
  occurred_on date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- APPOINTMENTS & BOOKINGS
-- ============================================================

-- Appointments - for service-based businesses
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- COMPLIANCE & REGULATORY
-- ============================================================

-- Compliance items - licenses, permits, etc.
create table compliance_items (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  license_type text not null,
  issue_date date,
  expiry_date date,
  status text default 'active' check (status in ('active','expiring_soon','expired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GUARDIAN / ALERT SYSTEM
-- ============================================================

-- Guardian events - alerts and notifications
create table guardian_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  type text not null,
  message text not null,
  severity text default 'info' check (severity in ('info','caution','critical')),
  linked_entity_type text,
  linked_entity_id uuid,
  resolved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables that have the column
create trigger update_businesses_updated_at before update on businesses
  for each row execute function update_updated_at_column();

create trigger update_app_users_updated_at before update on app_users
  for each row execute function update_updated_at_column();

create trigger update_customers_updated_at before update on customers
  for each row execute function update_updated_at_column();

create trigger update_suppliers_updated_at before update on suppliers
  for each row execute function update_updated_at_column();

create trigger update_items_updated_at before update on items
  for each row execute function update_updated_at_column();

create trigger update_transactions_updated_at before update on transactions
  for each row execute function update_updated_at_column();

create trigger update_ledger_entries_updated_at before update on ledger_entries
  for each row execute function update_updated_at_column();

create trigger update_expenses_updated_at before update on expenses
  for each row execute function update_updated_at_column();

create trigger update_appointments_updated_at before update on appointments
  for each row execute function update_updated_at_column();

create trigger update_compliance_items_updated_at before update on compliance_items
  for each row execute function update_updated_at_column();

create trigger update_guardian_events_updated_at before update on guardian_events
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - CRITICAL FOR MULTI-TENANCY
-- ============================================================

-- Enable RLS on all tables
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

-- ============================================================
-- RLS POLICIES - IMPLEMENT BEFORE GOING LIVE
-- ============================================================

-- IMPORTANT: These policies ensure users can only see their own business data.
-- Uncomment and modify these after you set up authentication.

/*
-- Example policy for customers table:
create policy "business_isolation_customers" on customers
  for all using (
    business_id in (
      select business_id from app_users 
      where auth_user_id = auth.uid()
    )
  );

-- Apply similar policies to ALL tables above.
-- Pattern: "business_isolation_TABLE_NAME" on TABLE_NAME
--   for all using (
--     business_id in (
--       select business_id from app_users 
--       where auth_user_id = auth.uid()
--     )
--   );
*/

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Common query indexes
create index idx_customers_business_id on customers(business_id);
create index idx_customers_name on customers(name);
create index idx_items_business_id on items(business_id);
create index idx_items_name on items(name);
create index idx_transactions_business_id on transactions(business_id);
create index idx_transactions_customer_id on transactions(customer_id);
create index idx_transactions_created_at on transactions(created_at);
create index idx_ledger_entries_business_id on ledger_entries(business_id);
create index idx_ledger_entries_customer_id on ledger_entries(customer_id);
create index idx_ledger_entries_status on ledger_entries(status);
create index idx_inventory_movements_item_id on inventory_movements(item_id);
create index idx_appointments_business_id on appointments(business_id);
create index idx_appointments_start_time on appointments(start_time);
