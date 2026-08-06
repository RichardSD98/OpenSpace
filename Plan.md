# Plan — UI/UX design system

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

None of the `526b141` changes have been checked in a browser — the evidence so
far is that `npm run build` passes and every `var()` in the built CSS resolves.
Before merging, walk Home, Listings, ListingDetail, PostListing and the auth
pages in both themes, at 400px and desktop width, and tab through a form to
confirm the new focus rings appear.
