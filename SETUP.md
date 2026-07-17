# Setup Checklist

Since you already know GitHub and Supabase, this is a checklist, not a tutorial.

## GitHub
1. Create a new repo — `business-brain` (private, until there's something worth showing)
2. Push this folder structure as the first commit
3. Set up branch protection on `main` even solo — forces you to review your own diffs before merging, which matters more once the Guardian logic gets non-trivial
4. Add a `.gitignore` for node_modules, .env, and any build artifacts

## Supabase
1. New project → note the project URL and anon/service keys
2. Run `supabase/migrations/0001_core_schema.sql` in the SQL editor (or via CLI if you prefer migrations-as-code from day one — worth it long-term given how many archetype modules are coming)
3. **Write the RLS policies before writing a single line of app code.** The migration file leaves this as an explicit unfinished task — every table needs a policy scoping rows to the business the logged-in user belongs to. Skipping this is the single most common way solo-built apps leak one business's data to another.
4. Enable email/phone auth depending on how you want owners to sign up (phone is likely more natural for this audience given the research on how traders actually operate)
5. Turn on Realtime for `guardian_events` — this is what lets the Guardian push alerts live without you building a separate notification system

## Local environment
1. `.env` needs: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
2. Never commit `.env` — double check `.gitignore` catches it

## First real milestone
Get a single business, a single item, and a single transaction round-tripping through the schema — insert via the app, read it back, confirm RLS actually blocks a second test business from seeing the first one's data. This one test is worth doing carefully; everything else is built on top of it holding true.
