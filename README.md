# LedgerMind

The bookkeeping system that understands what it means. Universal Core + Archetype Modules — full vision in `docs/LedgerMind-Master-Blueprint.md`.

## Structure

```
ledgermind/
├── supabase/migrations/     # Real Postgres schema
├── apps/web/onboarding/     # First-open carousel + business setup
├── apps/web/recorder/       # My Book — the working sale/debt recorder
└── docs/                    # Blueprint and research (add separately)
```

## Setup

1. Create a Supabase project
2. Run `supabase/migrations/0001_core_schema.sql` in the SQL editor
3. Write RLS policies per table (documented at the bottom of the migration file) before any real user data touches this
4. Paste your Supabase URL and anon key into `apps/web/recorder/supabaseClient.js`
5. Open `apps/web/onboarding/index.html` first — that's the real starting point of the app
