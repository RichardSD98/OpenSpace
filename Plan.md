# Plan

Two workstreams. **Part A** is the next session's work and is blocking; **Part B**
is the standing design-system backlog.

---

# Part A — Environments, for 2026-08-17

Set up on 2026-08-16: `dev` and `staging` branches now exist, both cut from
`f43c080`. The full runbook is `docs/environments.md` — this is the running
order and what is still outstanding.

## Branch state

```
dev      08fdbb7   carries the empty states, launch copy, reset tooling
staging  f43c080   same, minus the environments doc
main     f3c7ca5   production on Vercel — 5 commits behind, deliberately
```

`main` has **none** of the empty-state work. Demo from `staging`, not from the
current production URL, or the client sees the old UI over an empty database.

## 1. Capture the schema — everything else is blocked on this

The tables were created by hand in the dashboard and exist in no migration, so
a new Supabase project has nothing to build from. Needs the Supabase login and
the production DB password, so Shahied runs it:

```bash
npx supabase login
npx supabase link --project-ref vxugapoujtvzjxwcgtfs
npx supabase db pull
```

Then renumber the generated migration to sort before
`20260805120000_add_shared_rent_to_listings.sql` — or delete that file if the
pulled baseline already contains `shared_rent`, which it will. Commit to `dev`.

**Effort:** minutes, once the password is to hand. Closes the gap
`supabase/README.md` has been warning about since before this work started.

## 2. Create `openspace-dev` and `openspace-staging`

`supabase link` + `db push` per project. Two things `db push` does **not**
carry, both of which fail silently:

- the `listing-photos` **storage bucket** and its policies — storage sits
  outside the Postgres schema, so photo upload breaks with no error;
- **auth redirect settings** — otherwise verification and reset emails send
  people into the wrong environment.

## 3. Wire the Vercel variables

`main` stays the Production Branch. The mechanism that makes this work is that
a Preview variable can be pinned to a *specific branch*; that is what keeps
`dev` and `staging` on different databases. Table of which variable goes where
is in `docs/environments.md`.

Watch `CLIENT_URL` (the CORS origin in `backend/server.js`) and `VITE_API_URL`
(the axios base in `frontend/src/api/axios.js`) — point either at the wrong
environment and the browser blocks every request.

## 4. Prove the isolation before trusting it

Post a listing on the `dev` URL, then run `node scripts/demo-reset/verify.js`
against prod. Prod still empty means genuinely separate. The listing appearing
means a variable is on the wrong project — better found now than mid-demo.

## 5. Still unverified from 2026-08-16

**Nothing from the empty-state work has been opened in a browser.** The Chrome
extension was not connected, so the evidence is `npm run build` passing, every
module transforming under Vite, and seven unit checks on the storage lib.

Before demoing, walk Home, Listings, MyListings, Favourites, MyRequests and
ViewingRequests **with the database empty**, in both themes, at 400px and
desktop. Confirm the launch state reads well and the icon circles line up.
This folds into the Part B walkthrough below — do them in one pass.

## 6. Unrelated, but do not let it rot

`README.md:225` ends with a bare `inam9FvkPTAa6pqv`, which looks like a
credential and is public on GitHub. Rotate it if it is live, then delete the
line.

---

# Part B — UI/UX design system

Remaining work from the design-layer audit of 2026-08-06. The audit covered
`frontend/src/index.css` (3,095 lines), `tailwind.config.js`, `index.html` and
the inline styles across 24 components.

Line references are against `526b141` and will drift as the file changes.

## Done

Landed in `526b141` (branch `feat/shared-rent-polish-and-type-scale`):

- Design token block — an 11/12/13/14/16/20/24/28/32/40/48px ladder plus four
  fluid display steps. 143 `font-size` declarations across 40 distinct values
  swept onto 16 token references. Tracking 8 → 3 values, radius 9 → 3.
- Faux bold removed. Inter now loads 600; the three `font-weight: 700`
  declarations dropped to it.
- `body` unpinned from `15px` to `0.9375rem`, so browser text scaling works.
- `:focus-visible` rings for the five controls that set `outline: none`.
- A `prefers-reduced-motion` block, which the stylesheet had entirely lacked.
- Filter chips grown to a 44px touch target under 640px.

Landed in `cb848aa` and `f43c080` on 2026-08-16:

- A shared `EmptyState` component, plus `LaunchingSoonState` holding the
  pre-launch copy. Six pages routed through it — Home, Listings, MyListings,
  Favourites, MyRequests, ViewingRequests — replacing three ad-hoc CSS rules
  with one token-based `.empty-state` block.
- Browse screens now separate "nothing here yet" from "your filters excluded
  everything", decided by the params actually sent rather than unsubmitted form
  state.
- Homepage stat counter no longer floors at `Math.max(total, 340)`, which had
  it advertising "340+ listings" above an empty grid.
- Recently viewed stores listing **ids** rather than whole listing objects, so
  localStorage stopped being a stale mirror of the database. Old entries
  migrate on read.

`LaunchingSoonState` is the one thing to rewrite on launch day — after go-live
an empty marketplace means something broke, and "launching soon" becomes
misleading.

---

## 1. `--card` is undefined — `index.css:1087`

`.auth-card` sets `background: var(--card)` and no such token exists, in either
theme. The login, register, forgot-password and reset-password cards currently
fall through to a transparent background. Predates the token work — the variable
was never defined.

**Fix:** decide whether the auth card should sit flush with the page (`var(--bg)`)
or lift off it (`var(--bg-subtle)`), then use that token. One line.

**Effort:** minutes. **Do this first** — it is a live visual bug.

---

## 2. Scope the global `* { transition }` — `index.css:96`

Four properties transition on every element in the document, including
pseudo-elements, on a 0.35s timer. It exists to make the dark-mode toggle
smooth, but it also applies to skeleton loaders, dropdown opens and hover
states, which read as slightly laggy. It has already spawned **33**
`transition: … !important` overrides fighting it.

**Fix:** scope the rule to `html.theme-switching *`, and have the dark-mode
handler in `context/DarkModeContext.jsx` add that class, flip the theme, then
remove it after ~400ms. Then delete the `!important` overrides that only exist
to escape the global rule — checking each, since a few set genuinely different
durations and should keep them.

**Watch for:** the `.reveal` / `.safety-item` overrides at `index.css:101` are
load-bearing for the scroll reveal system. Verify reveals still animate.

**Effort:** an hour, most of it unpicking the 33 overrides.

---

## 3. Reconcile the two type systems — `tailwind.config.js`

`tailwind.config.js` defines a well-built 7-step `fluid-*` scale with proper
`clamp()` and paired line-heights. Only six files use it:

```
components/ui/Card.jsx      components/ui/ResponsiveImage.jsx
components/ui/Header.jsx    components/ui/Section.jsx
components/ui/ImageGallery.jsx   pages/ResponsiveShowcase.jsx
```

None of them are pages a user actually lands on. Meanwhile `index.css` now has
its own `--text-*` / `--display-*` tokens. Two scales, neither aware of the other.

**Fix:** make `tailwind.config.js` read from the CSS custom properties
(`fontSize: { md: 'var(--text-md)', … }`) so there is one source of truth and
the Tailwind utilities and hand-written CSS cannot drift apart.

**Effort:** an hour. **Do this before item 4**, or the migration will target a
scale that is about to change.

---

## 4. Migrate inline styles — 228 `style={{…}}` blocks

Every one is a design value that cannot participate in the theme, will not be
found by a search, and will not pick up a token change. Worst offenders:

| File | Blocks |
|---|---|
| `pages/ListingDetail.jsx` | 40 |
| `pages/ViewingRequests.jsx` | 25 |
| `components/Skeleton.jsx` | 25 |
| `pages/Favourites.jsx` | 18 |
| `pages/VerifyEmail.jsx` | 17 |
| `components/SelectDropdown.jsx` | 13 |
| `components/DatePicker.jsx` | 12 |

The `.os-check` change in `526b141` — replacing an inline-styled checkbox with a
class — is the pattern to follow.

**Approach:** one page per commit, largest first. For each, move the values into
a named class in `index.css` using tokens, and delete the inline object. Inline
styles that are genuinely dynamic (computed widths, transforms driven by state)
stay inline — this is about static design values only.

**Effort:** several sessions. Independent per file, so it can be done in gaps.

---

## 5. Align breakpoints

`index.css` uses `960 / 768 / 640 / 400`. `tailwind.config.js` declares
`480 / 640 / 768 / 960 / 1200 / 1440`. The 400-vs-480 disagreement means small
phones get inconsistent treatment depending on which system styled a component.

**Fix:** drop `400px` from the CSS in favour of `480px`, checking the four
`@media (max-width: 400px)` blocks still behave at the wider bound.

**Effort:** under an hour.

---

## 6. Deferred, with reasons

Not oversights — decisions:

- **Five raw `clamp()` values remain** (`index.css:1908, 2642, 2839, 2935, 3008`).
  They use aggressive `8vw`–`11vw` scaling, tuned per component for long price
  and title strings that wrap badly. Flattening them onto `--display-*` would
  regress that for no readability gain. Revisit only if a heading visibly breaks.
- **`.phone-code` keeps `letter-spacing: 0.01em`** (`index.css:1272`). Slight
  positive tracking on the "+264" dial code is correct typography for numerals
  and is a different problem from the uppercase-eyebrow tracking that
  `--tracking-caps` solves.

---

## Not yet verified

Neither the `526b141` changes nor the 2026-08-16 empty-state work has been
checked in a browser — the evidence is that `npm run build` passes, every
`var()` in the built CSS resolves, and every module transforms under Vite.

Before merging, walk Home, Listings, ListingDetail, PostListing and the auth
pages in both themes, at 400px and desktop width, and tab through a form to
confirm the new focus rings appear. Do this in the same pass as Part A §5,
which needs the same screens walked with the database empty.
