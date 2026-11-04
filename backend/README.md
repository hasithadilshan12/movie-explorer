# MovieExplorer — Backend API

Express 5 + Mongoose API for the MovieExplorer frontend. Handles accounts, Google
sign-in, watchlists, favorites and movie reviews.

## Run

```bash
npm install
npm run dev     # nodemon
npm start       # production
```

Default URL: <http://localhost:5000> · health check: `GET /health`

## Environment variables (`.env`)

Copy `.env.example` to `.env`:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign 7-day session tokens |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Comma-separated allowed origins (`http://localhost:5173,http://127.0.0.1:5173,...`) |
| `GOOGLE_CLIENT_ID` | Google OAuth **Web application** client ID (same value as the frontend's `VITE_GOOGLE_CLIENT_ID`) |

## Endpoints

### Auth
- `POST /auth/register` — `{ username, email, password }`
- `POST /auth/login` — `{ identifier, password }` (email or username)
- `POST /auth/google` — `{ credential }` (Google ID token)
- `GET /auth/me` — current user (Bearer token)
- `PATCH /auth/me` — `{ username }`

### Library (Bearer token required)
- `GET /watchlist` — watchlist + favorites (movie IDs)
- `POST /watchlist/add` — `{ movieId }`
- `DELETE /watchlist/:movieId`
- `POST /watchlist/favorites/add` — `{ movieId }`
- `DELETE /watchlist/favorites/:movieId`

### Reviews
- `GET /reviews/:movieId` — public list + `{ count, average }`
- `GET /reviews/mine` — current user's reviews
- `POST /reviews/:movieId` — `{ rating (1–10), comment }` (create or update)
- `DELETE /reviews/:movieId` — delete your review

## Google sign-in

1. Create an OAuth client ID (Web application) in Google Cloud Console.
2. Add `http://localhost:5173` and `http://127.0.0.1:5173` as authorized JavaScript origins.
3. Set `GOOGLE_CLIENT_ID` here and `VITE_GOOGLE_CLIENT_ID` in the frontend `.env`.
4. Restart both servers. The API verifies the token audience with `google-auth-library`.

## Security

- `helmet` security headers and JSON body size limits
- CORS allow-list via `CLIENT_URL`
- Rate limiting on `/auth` (100 requests / 15 minutes)
- Passwords hashed with bcrypt; JWT sessions expire after 7 days
- Never commit `.env` (already in `.gitignore`)
