# Business Brain

The AI that understands every business. Universal Core + Archetype Modules architecture — see `/docs` for the full blueprint reference.

## Repo structure

```
business-brain-repo/
├── core/                          # Universal engine — Recorder, Guardian, Analyst, Briefing
│                                   # Archetype-agnostic. If a feature only makes sense
│                                   # for one business type, it does NOT belong here.
├── modules/
│   └── archetype-1-inventory-retail/   # First module. Imports core, adds archetype-specific
│                                        # logic only (reorder recalculation, variant matrix, etc.)
├── apps/
│   └── mobile/                    # React Native app — the actual user-facing product
├── supabase/
│   └── migrations/                # Postgres schema, versioned, matches Core Data Model doc
└── docs/                          # Blueprint, data model, MVP specs — the permanent record
```

## Why this structure

This mirrors the Universal Core + Archetype Modules architecture directly — the folder structure IS the architecture, not just a diagram describing it. `core/` never imports from `modules/`. Each module imports from `core/` and extends it. This makes it structurally hard to accidentally leak archetype-specific logic into the shared engine.

## Setup

1. Clone this repo
2. Create a new Supabase project
3. Run the migration in `supabase/migrations/0001_core_schema.sql` against it
4. Write and apply the RLS policies noted at the bottom of that migration file — do not skip this, it's the NDPR/data-isolation requirement from the blueprint, not optional
5. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key
6. See `docs/SETUP.md` for the full checklist

## Status

- [x] Vision, architecture, and all 10 archetypes researched (see `docs/`)
- [x] Core data model designed
- [x] Archetype 1 MVP feature list locked
- [x] Design tokens locked, wireframe mockup built
- [ ] Core schema deployed to a live Supabase project
- [ ] Core engine built (Recorder + Guardian)
- [ ] Archetype 1 module built
