[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=24241023&assignment_repo_type=AssignmentRepo)

# News Aggregator API

A production-lean RESTful API for a personalized news aggregator. Users sign up,
log in, set topic preferences, and fetch news matched to those preferences from
an external provider (NewsAPI.ai / Event Registry). Users can also mark articles
read, favorite them, and search by keyword.

Built with **Node.js + Express**, **JWT** auth, **bcrypt** password hashing,
**MongoDB (Mongoose)** persistence, **zod** validation, **helmet** security
headers, **pino** structured logging, and an in-memory TTL cache with graceful
upstream fallback.

## Architecture

Layered Express app:

```
app.js        → builds & exports the Express app (routes + error handler); no listen
server.js     → runtime entry: load env, connect Mongo, app.listen
src/
  config/     → env loading/validation, Mongo connection helpers
  models/     → Mongoose User schema (+ article snapshots)
  middleware/ → JWT auth, zod validation, central error handler
  routes/     → /users, /news routers
  controllers/→ HTTP glue (thin; delegate to services)
  services/   → auth (bcrypt/jwt), news (fetch/normalize/cache/fallback), TTL cache
  utils/      → ApiError, response envelope helper, logger, async handler
  validation/ → zod schemas
```

Requests flow **routes → controllers → services**. Services throw `ApiError`;
controllers use `next(err)`; a central error handler produces the error envelope.

## Uniform response envelope

**Every** response uses one consistent shape. Payload fields always live inside
`data`; error details always live inside `error`.

Success:
```json
{ "success": true, "data": { /* endpoint payload */ } }
```

Error:
```json
{ "success": false, "error": { "message": "human-readable reason" } }
```

## Setup

**Prerequisites:** Node.js 18+ (native `fetch`). A running MongoDB is required to
run the server (`npm start`); the test suite spins up its own in-memory MongoDB
and needs no external DB.

```bash
npm install
cp .env.example .env   # then fill in the values below
```

Configure `.env`:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | HTTP port (default `3000`) |
| `MONGO_URI` | MongoDB connection string (**required** outside tests) |
| `JWT_SECRET` | Long random string for signing tokens (**required** outside tests) |
| `JWT_EXPIRES_IN` | Token lifetime (default `1h`) |
| `NEWSAPI_AI_KEY` | Event Registry / NewsAPI.ai API key (optional; `/news` falls back to an empty list without it) |
| `NEWS_CACHE_TTL_MS` | News cache TTL in ms (default `600000` = 10 min) |

## Run

```bash
npm start      # node server.js
npm run dev    # node --watch server.js (auto-restart)
```

## Test

```bash
npm test       # tap + supertest; uses mongodb-memory-server (offline, no key needed)
```

The news upstream is stubbed in tests via an injectable fetch, so tests are
deterministic and consume no API quota.

## Endpoints

The `data` column is the payload found under the `data` key on success. All
`/users/preferences` and `/news/*` routes require an `Authorization: Bearer <token>`
header and return **401** (error envelope) without a valid token.

| Method | Path | Auth | Success (200) `data` | Errors |
|---|---|---|---|---|
| POST | `/users/signup` | – | `{ user }` (no password) | 400 invalid, 409 dup email |
| POST | `/users/login` | – | `{ token }` | 400 missing, 401 bad creds |
| GET | `/users/preferences` | JWT | `{ preferences }` | 401 |
| PUT | `/users/preferences` | JWT | `{ preferences }` | 400 invalid, 401 |
| GET | `/news` | JWT | `{ news }` (fallback-safe) | 401 |
| POST | `/news/:id/read` | JWT | `{ message }` | 401 |
| GET | `/news/read` | JWT | `{ news }` | 401 |
| POST | `/news/:id/favorite` | JWT | `{ message }` | 401 |
| GET | `/news/favorites` | JWT | `{ news }` | 401 |
| GET | `/news/search/:keyword` | JWT | `{ news }` | 401 |

Notes:
- Signup returns **200** (not 201).
- `:id` for read/favorite is a URL-encoded article id. Send the article body
  (`title`, `url`, etc.) so a snapshot can be stored. Marking is **idempotent** —
  re-marking an already-read/favorited article still returns 200 with no duplicate.
- `GET /news` and search **never 5xx** on upstream failure or missing key — they
  serve stale cache or an empty list with 200.

## Example requests

Sign up:
```bash
curl -s -X POST http://localhost:3000/users/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Clark Kent","email":"clark@superman.com","password":"Krypt()n8","preferences":["movies","comics"]}'
# → { "success": true, "data": { "user": { "name": "Clark Kent", "email": "clark@superman.com", "preferences": ["movies","comics"], ... } } }
```

Log in:
```bash
curl -s -X POST http://localhost:3000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"clark@superman.com","password":"Krypt()n8"}'
# → { "success": true, "data": { "token": "<jwt>" } }
```

Fetch personalized news:
```bash
curl -s http://localhost:3000/news \
  -H "Authorization: Bearer <jwt>"
# → { "success": true, "data": { "news": [ { "articleId": "...", "title": "...", "url": "...", "source": "...", "publishedAt": "...", "description": "..." } ] } }
```

Error example (no token):
```bash
curl -s http://localhost:3000/news
# → { "success": false, "error": { "message": "Authentication required" } }
```
