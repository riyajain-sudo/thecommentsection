# The Clothesline 🎐

A quiet corner of the internet to hang up poems and half-formed thoughts —
signed or anonymous — for anyone to read. Built on the MERN stack
(MongoDB, Express, React, Node) with a soft pastel look and a few gentle
animations (poems sway on their line like laundry in the breeze).

## Project structure

```
poem-app/
├── backend/     Express + MongoDB API
└── frontend/    React app (Vite)
```

## Features

- **Accounts** — sign up / log in with email + password (JWT-based sessions)
- Post a poem or thought while logged in, and choose per-poem whether it's
  shown **anonymously** or under your username
- Browse everyone's poems on the home feed, search and sort by newest / most loved
- Tag poems (e.g. `grief`, `morning`, `love`) and filter by them
- **Like (♡) any poem** — likes are tied to your account, so they persist
  across devices and can be un-liked
- **Favorites page** — see every poem you've liked, all in one place
- Only the account that wrote a poem can take it down, even if it was
  posted anonymously
- Soft pastel palette, floating background blobs, and poem cards that
  sway gently like they're pinned to a clothesline

## Requirements

- Node.js 18+
- A MongoDB database — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or
  - a local MongoDB server (`mongod`)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set two things:

1. `MONGO_URI` — your MongoDB connection string, e.g.
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/clothesline
   ```
2. `JWT_SECRET` — a long random string used to sign login sessions. Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Paste the output in as `JWT_SECRET=...`. Don't reuse the placeholder value —
   the server refuses to start without a real one.

Then start the API server:

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start
```

The API runs at `http://localhost:5000` by default.

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` already points at `http://localhost:5000/api`, so you
only need to change it if your backend runs somewhere else.

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 3. Building for production

```bash
cd frontend
npm run build
```

This outputs a static site to `frontend/dist`, which you can deploy to
any static host (Vercel, Netlify, S3, etc.). Deploy `backend/` to any
Node host (Render, Railway, Fly.io, a VPS...) and point
`VITE_API_URL` at its public URL before building.

## API reference

Routes marked 🔒 require an `Authorization: Bearer <token>` header (the
token returned from register/login).

| Method | Route                  | Description                                    |
|--------|------------------------|-------------------------------------------------|
| POST   | `/api/auth/register`   | Create an account                                |
| POST   | `/api/auth/login`      | Log in, get a token                              |
| GET    | `/api/auth/me`         | 🔒 Get the logged-in user                        |
| GET    | `/api/poems`           | List poems (`search`, `tag`, `sort`, `page`)     |
| GET    | `/api/poems/:id`       | Get a single poem                                |
| GET    | `/api/poems/mine`      | 🔒 Poems you've written                          |
| GET    | `/api/poems/favorites` | 🔒 Poems you've liked                            |
| POST   | `/api/poems`           | 🔒 Create a poem (`isAnonymous` controls display) |
| POST   | `/api/poems/:id/like`  | 🔒 Toggle like on/off                            |
| DELETE | `/api/poems/:id`       | 🔒 Delete a poem you wrote                       |

## Notes on moderation

This starter has no profanity filter, auth, or admin panel — it's a
clean base to build on. Before putting it in front of the public
internet, you'll likely want to add:

- Basic content moderation / reporting
- Stronger rate limiting (a simple limiter is included as a starting point)
- An admin route to remove poems without needing the poster's edit token

Enjoy the line. 🧺
