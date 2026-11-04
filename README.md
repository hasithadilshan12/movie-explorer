# 🎬 MovieExplorer

A full-stack, cinematic movie discovery app. Browse trending films, search and filter the
TMDB catalogue, open rich movie/person pages, watch trailers, build a watchlist and favorites
library, and share reviews with other movie lovers.

**Stack:** React 19 + Vite (frontend) · Express 5 + Mongoose (backend) · MongoDB Atlas · TMDB API · Google Identity Services

## Live

- **App:** https://movie-explorer-iota-five.vercel.app
- **API health:** https://movie-explorer-api-tan.vercel.app/api/health

## Repository layout

```
movie-explorer/
├── frontend/     React 19 + Vite single-page app
├── backend/      Express 5 REST API (auth, watchlist, favorites, reviews)
├── render.yaml   Render Blueprint for the backend
└── README.md
```

## Features

- Dark, responsive cinematic UI with a custom CSS design system
- Home page with an auto-rotating hero (5s) and trending / popular / top-rated / in-theatres / upcoming shelves
- Genre tiles backed by real film stills
- Discover page with text search, genre, year, rating, sort and "load more"
- Movie details: backdrop, score, cast, facts, streaming providers, trailer modal, similar movies
- Person pages with biography and filmography
- Watchlist + favorites library with stats
- Reviews with star ratings, edit/delete, community summary and rating breakdown
- Email/password authentication **and Google sign-in**
- Profile page, toasts, skeleton loaders, empty states, 404 page and error boundary
- Keyboard shortcut: `/` or `Ctrl/Cmd + K` opens quick search

## Local development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run dev              # http://localhost:5000
```

Required environment variables:

| Variable | Description |
| --- | --- |
| `PORT` | API port (defaults to `5000`) |
| `MONGO_URI` | MongoDB / Atlas connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 **Web application** client ID |
| `CLIENT_URL` | Comma-separated allowed origins, e.g. `http://localhost:5173` |

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # then fill in the values
npm run dev              # http://localhost:5173
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL (`http://localhost:5000` locally) |
| `VITE_TMDB_API_KEY` | TMDB API key |
| `VITE_GOOGLE_CLIENT_ID` | Same OAuth client ID as the backend |

Use **http://localhost:5173** (not a different port) so it matches the Google OAuth origins.

## Deployment (Vercel only — no credit card required)

Both apps run on Vercel's free Hobby plan.

### Backend → Vercel

The API is exported as a serverless Express app from `backend/api/[...path].js`, and
`backend/db.js` reuses the MongoDB connection across warm invocations.

1. Vercel → **Add New → Project** → import this repository.
2. Set **Root Directory** to `backend` and keep the framework preset as **Other**.
3. Add the environment variables:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `GOOGLE_CLIENT_ID` — the OAuth Web client ID
   - `CLIENT_URL` — your frontend URL (comma-separated list is supported)
4. Deploy. The API base becomes `https://<backend-project>.vercel.app/api`.
5. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Vercel functions use dynamic IPs).
6. Verify `https://<backend-project>.vercel.app/api/health` returns
   `{"status":"ok","database":"connected"}`.

> `render.yaml` is kept as an optional Render Blueprint. Render currently asks new
> accounts for a payment method, so Vercel is the card-free default.

### Frontend → Vercel

1. Vercel → **Add New → Project** → import the same repository again.
2. Set **Root Directory** to `frontend` (framework auto-detects as Vite).
3. Add the environment variables:
   - `VITE_API_URL` = your backend base **including `/api`**, e.g. `https://movie-explorer-api.vercel.app/api`
   - `VITE_TMDB_API_KEY` = your TMDB key
   - `VITE_GOOGLE_CLIENT_ID` = the OAuth Web client ID
4. Deploy. `frontend/vercel.json` already adds the SPA rewrite so deep links such as `/movie/550` work.

### Google sign-in (production)

1. Google Cloud Console → **APIs & Services → Credentials** → your **Web application** OAuth client.
2. Under **Authorized JavaScript origins** add:
   - `https://your-app.vercel.app`
   - `http://localhost:5173` (local development)
3. Keep `CLIENT_URL` on the backend project in sync with the Vercel frontend domain, and
   redeploy the backend after changing it.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Email / username sign-in |
| `POST` | `/auth/google` | Sign in with a Google ID token |
| `GET` | `/auth/me` | Current user |
| `GET` | `/watchlist` | Saved titles (watchlist + favorites) |
| `POST` | `/watchlist` | Add a title |
| `DELETE` | `/watchlist/:movieId` | Remove a title |
| `PATCH` | `/watchlist/:movieId` | Toggle favorite |
| `GET` | `/reviews/:movieId` | Reviews for a movie |
| `POST` | `/reviews` | Create a review |
| `PATCH` | `/reviews/:id` | Edit your review |
| `DELETE` | `/reviews/:id` | Delete your review |
| `GET` | `/health` | Service + database status |

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Vite dev server |
| `frontend` | `npm run build` | Production build |
| `frontend` | `npm run lint` | ESLint |
| `backend` | `npm run dev` | API with watch mode |
| `backend` | `npm start` | Production API |

---

Movie data and images from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
