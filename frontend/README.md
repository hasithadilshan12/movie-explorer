# MovieExplorer — Frontend

A cinematic movie discovery app built with **React 19 + Vite**. Browse trending films,
search and filter the TMDB catalogue, open rich movie/person pages, watch trailers, build a
watchlist and favorites library, and share reviews with other members.

## Highlights

- Dark, responsive cinematic UI (custom design system in `src/index.css`)
- Home page with auto-rotating hero and trending / popular / top-rated / in-theatres / upcoming shelves
- Discover page with text search, genre, year, rating, sort and infinite "load more"
- Movie details: backdrop, score ring, cast, facts, streaming providers, trailer modal, similar movies
- Person pages with biography and filmography
- Watchlist + Favorites library with stats (runtime, average score)
- Reviews with star ratings, edit/delete, community summary and rating breakdown
- Email/password authentication **and Google sign-in**
- Profile page with username editing and recent reviews
- Toasts, skeleton loaders, empty states, 404 page and an error boundary
- Keyboard shortcut: `/` or `Ctrl/Cmd + K` opens quick search

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The backend must be running on <http://localhost:5000>
(see `../backend`).

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # eslint
```

## Environment variables

Copy `.env.example` to `.env` and fill in what you need:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No (defaults to `http://localhost:5000`) | URL of the Express API |
| `VITE_TMDB_API_KEY` | No (a working fallback key is built in) | TMDB v3 API key |
| `VITE_GOOGLE_CLIENT_ID` | For Google login | Google OAuth **Web application** client ID |

Restart `npm run dev` after changing `.env`.

## Google sign-in setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Configure the **OAuth consent screen** (External is fine; add yourself as a test user).
3. **Create credentials → OAuth client ID → Web application**.
4. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
5. Copy the client ID into **both** files (they must match):
   - frontend `.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - backend `.env` → `GOOGLE_CLIENT_ID=...`
6. Restart the frontend and backend.

Until the client ID is set, the Google button shows a "Setup needed" badge and explains what to add.

## Project structure

```
src/
  components/   Navbar, Hero, MovieRow, MovieCard, TrailerModal, auth UI, loaders...
  context/      AuthContext, LibraryContext, ToastContext
  pages/        Home, Search, MovieDetails, Person, Watchlist, Profile, Login, Register, NotFound
  services/     api.js (backend), tmdb.js (TMDB)
  utils/        constants, formatting, images, video helpers
```

## Notes

- Movie data and images come from [TMDB](https://www.themoviedb.org/). This product uses the
  TMDB API but is not endorsed or certified by TMDB.
- Google login verifies the ID token on the backend with `google-auth-library`.
- Sessions use JWTs stored in `localStorage` and are validated against `/auth/me` on load.
