# 🏠 OpenSpace — Rental Listings for Windhoek, Namibia

A full-stack MERN rental listing web app for Windhoek, Namibia.  
Renters can browse and request viewings. Landlords can post and manage listings.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| Uploads   | Multer (local `/uploads` folder)    |

---

## Project Structure

```
OpenSpace/
├── backend/          Express API
│   ├── config/       MongoDB connection
│   ├── middleware/   auth.js, upload.js (Multer)
│   ├── models/       User, Listing, ViewRequest
│   ├── routes/       auth, listings, upload, viewRequests
│   ├── uploads/      Uploaded images (served statically)
│   └── server.js
└── frontend/         React + Vite app
    └── src/
        ├── api/      Axios instance
        ├── components/ Navbar, ListingCard, FilterSidebar, ProtectedRoute
        ├── context/  AuthContext (JWT + localStorage)
        └── pages/    Home, ListingDetail, PostListing, EditListing,
                      Login, Register, MyListings
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/openspace
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_optional
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Password Reset Security Setup

The forgot-password flow uses secure reset links, CAPTCHA validation, and rate limiting.

### Frontend environment

Add this to `frontend/.env` if CAPTCHA should be enabled:

```env
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

### Audit logging table (Supabase SQL)

Run this in your Supabase SQL editor to store password reset audit events:

```sql
create table if not exists public.security_audit_logs (
    id bigserial primary key,
    event_type text not null,
    event_status text not null,
    email_hash text,
    ip_hash text,
    user_agent text,
    reason text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.security_audit_logs enable row level security;

create index if not exists idx_security_audit_logs_created_at on public.security_audit_logs(created_at desc);
create index if not exists idx_security_audit_logs_event_type on public.security_audit_logs(event_type);
```

### Favourites table (Supabase SQL)

Run this to enable saved listings for renters:

```sql
create table if not exists public.favourites (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favourites_unique unique (user_id, listing_id)
);

alter table public.favourites enable row level security;

create policy "Users manage own favourites"
  on public.favourites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_favourites_user_id on public.favourites(user_id);
```

### Security behavior

- Uses non-enumerating responses so users cannot confirm if an email exists.
- Applies request throttling to both forgot-password and reset-password endpoints.
- Enforces strong password complexity and minimum length.
- Rejects password reuse when the new password matches the current one.
- Recommends MFA after successful reset.
- Requires HTTPS in production and applies secure HTTP headers.

---

## API Endpoints

### Auth
| Method | Endpoint             | Description        | Auth |
|--------|---------------------|--------------------|------|
| POST   | `/api/auth/register` | Register a user    | —    |
| POST   | `/api/auth/login`    | Login              | —    |
| GET    | `/api/auth/me`       | Get current user   | ✅   |

### Listings
| Method | Endpoint                    | Description              | Auth        |
|--------|-----------------------------|--------------------------|-------------|
| GET    | `/api/listings`             | Browse all (with filters)| —           |
| GET    | `/api/listings/:id`         | Get single listing       | —           |
| GET    | `/api/listings/my/listings` | Get landlord's listings  | ✅ lister   |
| POST   | `/api/listings`             | Create listing           | ✅ lister   |
| PUT    | `/api/listings/:id`         | Update listing           | ✅ owner    |
| DELETE | `/api/listings/:id`         | Delete listing           | ✅ owner    |

### Upload
| Method | Endpoint       | Description          | Auth |
|--------|----------------|----------------------|------|
| POST   | `/api/upload`  | Upload up to 6 photos| ✅   |

### View Requests
| Method | Endpoint                            | Description                | Auth |
|--------|-------------------------------------|----------------------------|------|
| POST   | `/api/view-requests/:listingId`     | Request to view a listing  | ✅   |
| GET    | `/api/view-requests/my`             | Renter's own requests      | ✅   |
| GET    | `/api/view-requests/listing/:id`    | Landlord sees requests      | ✅   |

### Query Parameters for GET /api/listings
| Param         | Example           |
|---------------|-------------------|
| `unitType`    | `apartment`       |
| `neighborhood`| `Katutura`        |
| `minRent`     | `3000`            |
| `maxRent`     | `8000`            |
| `page`        | `1`               |
| `limit`       | `12`              |

---

## Features

- 🔍 **Browse listings** — filter by unit type, neighbourhood, price range
- 🏠 **Listing detail** — full info with photo gallery
- 📋 **Post a listing** — landlord form with photo upload
- ✏️ **Edit/Delete** — manage your listings from the dashboard
- 📅 **Request to View** — renters can message landlords directly
- 🔐 **JWT Auth** — separate renter and lister roles
- 📱 **Responsive** — mobile-first with Tailwind CSS

---

## Windhoek Neighbourhoods Supported

**Central & inner city:** City Centre · Windhoek West · Klein Windhoek · Eros · Ludwigsdorf · Auasblick

**Northern suburbs:** Katutura · Wanaheda · Havana · Otjomuise · Greenwell Matongo

**Southern suburbs:** Khomasdal · Suiderhof · Hochland Park · Dorado Park · Cimbebasia · Prosperita

**Eastern suburbs:** Olympia · Pioneers Park · Academia · Rocky Crest · Sunset · Avis

**Other areas:** Brakwater · Goreangab · Otjomuise Extension · Rehoboth Road Corridor · Dordabis Road Corridor · Other




inam9FvkPTAa6pqv