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

Katutura · Khomasdal · Klein Windhoek · Olympia · Pioneerspark · Eros ·
Windhoek West · Hochland Park · Suiderhof · Rocky Crest · Otjomuise ·
Havana · Academia · Ludwigsdorf · Other




inam9FvkPTAa6pqv