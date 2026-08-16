# Environments

Three long-lived branches, each deploying to its own Vercel environment and its
own Supabase project.

| Branch | Vercel | Supabase project | Purpose |
|---|---|---|---|
| `main` | Production | `vxugapoujtvzjxwcgtfs` | What the client sees. Currently emptied for the demo. |
| `staging` | Preview (stable URL) | `openspace-staging` *(to create)* | Release candidate. Demo from here, not from prod. |
| `dev` | Preview | `openspace-dev` *(to create)* | Integration. Feature branches merge here first. |
| `feat/*` | Preview per PR | `openspace-dev` | One preview URL per pull request. |

Flow: `feat/*` → `dev` → `staging` → `main`. Nothing reaches `main` without
having been on `staging` first.

`dev` and `staging` were both created at `f43c080`, so they carry the empty
states, the launch copy and the demo-reset tooling. `main` is deliberately
behind at `f3c7ca5` until you promote.

---

## 1. Capture the schema — do this first

Everything else is blocked on this, and it is the gap `supabase/README.md` has
been warning about: the tables were created by hand in the dashboard and exist
in **no** migration file. A new Supabase project has nothing to build from.

These commands need your Supabase login and the production database password,
so run them yourself:

```bash
npx supabase login
npx supabase link --project-ref vxugapoujtvzjxwcgtfs
npx supabase db pull
```

`db pull` writes `supabase/migrations/<timestamp>_remote_schema.sql` containing
the live schema and its RLS policies. Then:

1. Renumber it so it sorts **before**
   `20260805120000_add_shared_rent_to_listings.sql`, or delete that file if the
   pulled baseline already contains the `shared_rent` column — it will, since
   the column is live in production.
2. Commit it to `dev`.

From that point the repo can rebuild the database from scratch, and
`scripts/demo-reset/reset.js` stops being the only safe way to clear data.

## 2. Create the two projects

In the Supabase dashboard, create `openspace-dev` and `openspace-staging` in the
same org. For each, from a checkout of `dev`:

```bash
npx supabase link --project-ref <new-project-ref>
npx supabase db push
```

Two things `db push` does **not** carry over — set them by hand in each project:

- **The `listing-photos` storage bucket**, and its policies. Storage lives
  outside the Postgres schema, so migrations never see it. Photo upload breaks
  silently without it.
- **Auth settings** — the site URL and redirect allowlist, or email
  verification and password reset will send people to the wrong environment.

## 3. Wire Vercel

**Settings → Git → Production Branch** stays `main`. Every other branch gets a
Preview deployment automatically; `staging` and `dev` will each have a stable
`-git-<branch>-` URL you can hand out.

**Settings → Environment Variables.** Vercel scopes variables to Production,
Preview and Development, and a Preview variable can be pinned to a *specific
branch* — that is what keeps `dev` and `staging` on different databases.

Set per scope:

| Variable | Production | Preview → `staging` | Preview → `dev` |
|---|---|---|---|
| `SUPABASE_URL` | prod project | staging project | dev project |
| `SUPABASE_SERVICE_KEY` | prod | staging | dev |
| `SUPABASE_ANON_KEY` | prod | staging | dev |
| `VITE_SUPABASE_URL` | prod | staging | dev |
| `VITE_SUPABASE_ANON_KEY` | prod | staging | dev |
| `VITE_API_URL` | prod API URL | staging API URL | dev API URL |
| `CLIENT_URL` | prod site URL | staging site URL | dev site URL |

`CLIENT_URL` is the CORS origin in `backend/server.js` and `VITE_API_URL` is the
axios base in `frontend/src/api/axios.js`. If either points at the wrong
environment the browser blocks the requests, so they are worth double-checking.

A Preview variable with no branch pinned applies to *every* preview branch,
including feature branches — which is the sane default for `dev`'s credentials.

## 4. Verify the isolation

The failure this whole setup exists to prevent is a test on `dev` writing into
the database the client is being shown. Prove it is actually isolated before
trusting it:

```bash
node scripts/demo-reset/verify.js     # against prod: expect empty
```

Then post a listing on the `dev` URL and run it again. If prod is still empty,
the environments are genuinely separate. If the listing shows up, a variable is
pointing at the wrong project — fix that before the demo.
