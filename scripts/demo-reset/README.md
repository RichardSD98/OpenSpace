# Demo reset

Empties the OpenSpace database so the app can be demonstrated with no existing
data, and puts the backup in place first.

Three scripts, run in this order:

```bash
node scripts/demo-reset/backup.js     # dump everything to backups/<timestamp>/
node scripts/demo-reset/reset.js      # dry run — prints the plan, deletes nothing
node scripts/demo-reset/reset.js --confirm
node scripts/demo-reset/verify.js     # confirm empty, and that the schema survived
```

They read `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from `backend/.env` and use
the service role key, which bypasses RLS. Dependencies resolve out of
`backend/node_modules`, so there is nothing extra to install.

## What gets deleted

`favourites`, `view_requests`, `listings`, `security_audit_logs`, `profiles`,
every `auth.users` account, and every object in the `listing-photos` bucket.

Child tables go first so no delete is ever blocked by a foreign key, and
`auth.users` goes last because deleting a user cascades into whatever still
references it.

Flags: `--keep-auth` leaves accounts intact, `--keep-storage` leaves photos.

## Rows, not tables

`reset.js` deletes **rows**. It never drops or recreates a table, so the schema,
its RLS policies and its indexes are untouched and the application works against
the empty database with no migration step.

This is not a style preference. As `supabase/README.md` explains, this repo has
no baseline migration — every table was created by hand in the dashboard. A
dropped schema could not be rebuilt from this codebase. Until `supabase db pull`
has been run and its output committed, **dropping anything is unrecoverable.**

`verify.js` guards that boundary: it reads every table and fails if one has
become unreachable, because an empty database and a destroyed one look identical
from the API until someone tries to post a listing.

## Backups

`backups/` is gitignored — the dumps contain real names, phone numbers, email
addresses and password-reset audit records. Do not commit them, and do not paste
them into a ticket.

Each run writes `backups/<ISO timestamp>/`:

| File | Contents |
|---|---|
| `<table>.json` | every row, paginated at 1,000 |
| `auth_users.json` | full auth records from the admin API |
| `storage_listing-photos.json` | object metadata |
| `storage/listing-photos/…` | the actual photo files |
| `schema-hint.json` | tables and columns from the PostgREST OpenAPI document |
| `manifest.json` | row counts, timestamp, and any per-source errors |

`schema-hint.json` is a consolation prize, not a schema backup. It has no RLS
policies, indexes, constraints or defaults. Run `supabase db pull` for the real
thing — it needs the database password, which is not in `.env`.

## Restoring

There is no restore script, because restoring is not the inverse of deleting
here: `auth.users` rows cannot be reinserted with their original IDs through the
admin API, and every `profiles.id`, `listings.landlord_id` and `favourites.user_id`
is a foreign key onto those IDs. Recreating accounts mints new IDs, so the
relationships in the dumps would have to be remapped.

Treat the backup as an archive to read, not a rollback button. If the data must
come back intact, restore from a Supabase point-in-time backup on the dashboard
instead.
