
# Database schema

The `listings`, `profiles`, `favourites` and `view_requests` tables live in
Supabase. Schema changes belong in `supabase/migrations/` as SQL files so they
are reviewed in the pull request that needs them and applied the same way to
every environment — no dashboard clicking, nothing to forget.

## One-time setup

Install the CLI and link the repo to the Supabase project:

```bash
npm install -g supabase
supabase login
supabase link --project-ref vxugapoujtvzjxwcgtfs
```

That ref is the OpenSpace production project (`main` branch, RichardSD98's Org).
It also appears in the dashboard URL, `supabase.com/dashboard/project/<ref>`.
The ref is not a secret — it is the hostname the frontend already calls — and
linking writes `supabase/config.toml`, which is safe to commit. The API keys are
the secret part and stay in `.env`.

## ⚠️ The baseline migration is still missing

`supabase/migrations/` currently contains only the `shared_rent` change. Every
table and column that existed before it was created by hand in the dashboard and
is **not** yet captured in SQL, so `supabase db push` against an empty project
would fail — there is no `listings` table for the migration to alter.

The saved queries under **SQL Editor → Private** are the real, undocumented
migration history: the favourites and view-request tables and their RLS
policies, the security audit logs table, and the profile-role backfills. None of
that is reproducible from this repo today.

Fix this once, from a machine linked to the project that has the real schema:

```bash
supabase db pull
```

That writes a migration containing the current schema, RLS policies included.
Commit it, then renumber it so it sorts **before**
`20260805120000_add_shared_rent_to_listings.sql`, or delete the shared-rent file
if the pulled baseline already contains the column — it will, since the column
is live in production. After that the migration history is complete and a fresh
environment can be built from scratch, and the saved dashboard queries stop
being load-bearing.

## Making a schema change

```bash
supabase migration new add_something          # creates a timestamped .sql file
# edit supabase/migrations/<timestamp>_add_something.sql
supabase db push                              # applies it to the linked project
```

Commit the `.sql` file with the code that depends on it. Repeat `db push` on any
other environment (staging, a teammate's project) to bring it up to date.

## Row Level Security

The backend uses the service role key (`backend/config/supabase.js`), which
bypasses RLS, and the frontend uses Supabase directly only for auth and photo
storage. So adding a column does not usually require a policy change.

Policies do exist, though — `favourites` and `view_requests` have them — and
they are schema, so they belong in migrations alongside the tables once the
baseline is pulled. Storage bucket policies are separate and stay in the
dashboard.
