# CineSense — Multi-Lingual Movie Review Sentiment & Trailer Resolver

> **Understand what audiences really feel. Watch verified official trailers.**

CineSense is a modern, reproducible cinematic platform featuring multi-lingual sentiment analysis, upcoming release anticipation tracking, and an intelligent YouTube trailer resolution engine with embed-health diagnostics.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │    cinesense-app (Next.js 16 Full-Stack) │
                      │    Port 3000 — App Router & Turbopack    │
                      └────────────────────┬─────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌──────────────────────────┐                  ┌──────────────────────────┐
       │   backend (Express API)  │                  │  frontend (Vite React)   │
       │   Port 5000              │                  │  Port 5173 / 5174        │
       │   Sequelize + SQLite/PG  │                  │  Tailwind + FramerMotion │
       └────────────┬─────────────┘                  └──────────────────────────┘
                    │
                    ├──► VADER NLP & Sentiment Pipeline
                    ├──► Intelligent YouTube Trailer Resolver
                    └──► Background Scheduled Sync & Health Validation
```

- **`cinesense-app`**: Next.js 16 (React 19) full-stack web application with server components, discovery, and trailer player (`http://localhost:3000`).
- **`backend`**: Node.js & Express REST API with Sequelize ORM supporting local zero-config SQLite or remote PostgreSQL (`http://localhost:5000`).
- **`frontend`**: Vite + React 19 single-page dashboard with interactive analytics (`http://localhost:5173`).

---

## Prerequisites

- **Node.js**: `>= 20.0.0` (LTS recommended, see `.nvmrc`)
- **npm**: `>= 10.0.0`
- **Git**
- *(Optional)* Docker & Docker Compose for containerized execution.

---

## Quickstart (3 Steps)

### 1. Clone the repository
```bash
git clone https://github.com/kirankirankumarr15-cmd/movie-review.git
cd "Movie Review Sentiment Analyze"
```

### 2. Run automated setup (Installs, verifies envs, creates & seeds DB)
```bash
npm run setup
```
*(This sets up `.env` files from `.env.example`, runs migrations, and seeds verified movie & trailer data).*

### 3. Start development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to view the CineSense application.

---

## Available Root Commands

| Command | Description |
|---|---|
| `npm run setup` | One-command setup: environment checks, `.env` creation, DB migrations & seed |
| `npm run dev` | Starts the Next.js web application (`http://localhost:3000`) |
| `npm run dev:backend` | Starts the Express API server with nodemon (`http://localhost:5000`) |
| `npm run dev:frontend` | Starts the Vite React client (`http://localhost:5173`) |
| `npm run build` | Compiles and builds production bundles for all apps |
| `npm run start` | Starts the production Next.js server |
| `npm test` | Runs the automated test suite (anticipation formulas & trailer resolver) |
| `npm run lint` | Runs ESLint and Oxlint across all codebases |
| `npm run typecheck` | Typechecks both Next.js and Vite applications |
| `npm run db:migrate` | Runs database migrations |
| `npm run db:seed` | Seeds database with verified movies, trailers, and reviews |
| `npm run catalog:sync`| Synchronizes catalog movies into the database |

---

## Environment Variables Reference

CineSense is designed with **graceful runtime degradation**: if optional third-party API keys are missing, the app boots and serves offline demo data without crashing.

| Variable | Scope | Required? | Default / Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `cinesense-app` | No (Dev) | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | `cinesense-app` | Yes (Prod) | Random 32+ char secret for JWT session encryption |
| `TMDB_API_KEY` | Monorepo / App | Optional | TMDB v3 API Key (Get at [themoviedb.org](https://www.themoviedb.org/settings/api)) |
| `YOUTUBE_API_KEY` | Monorepo / App | Optional | Google YouTube Data v3 API Key |
| `NEXT_PUBLIC_SUPABASE_URL` | `cinesense-app` | Optional | Supabase Postgres URL (falls back to local JSON store) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `cinesense-app` | Optional | Supabase Anon Key |
| `PORT` | `backend` | No | `5000` |
| `SECRET_KEY` | `backend` | Yes (Prod) | JWT secret for user authentication |
| `DATABASE_URL` | `backend` | Optional | Postgres connection URI (defaults to `cinesense.sqlite`) |
| `FRONTEND_URL` | `backend` | No | `http://localhost:5173` |
| `VITE_API_URL` | `frontend` | No | `http://localhost:5000` |

---

## Health Check & Observability

Both web and backend expose standardized health check endpoints:

- **Next.js Web App**: `GET http://localhost:3000/api/health`
  ```json
  {
    "status": "ok",
    "service": "CineSense Web App (Next.js 16)",
    "environment": "development",
    "features": {
      "tmdb_connected": true,
      "supabase_connected": false,
      "sentiment_analysis_ai": "local_vader_sentiment"
    }
  }
  ```
- **Express Backend API**: `GET http://localhost:5000/api/health`
  ```json
  {
    "status": "ok",
    "service": "CineSense API (Node.js)"
  }
  ```

---

## Docker & Container Deployment

To run the entire platform via Docker:

```bash
docker compose up --build
```
This starts:
- **`cinesense-web`** on port `3000` (Next.js 16 with automatic healthcheck)
- **`cinesense-api`** on port `5000` (Express API with SQLite / Postgres volume)

---

## Background Services & Scheduled Jobs

The Express backend includes built-in in-process recurring tasks (no external message queues required):
- **12-Hour Sync**: Automatically refreshes upcoming movie metadata and releases.
- **24-Hour Nightly Validator**: Validates YouTube video embeddability and flags broken trailers.

Manual sync triggers:
- Ingest upcoming releases: `POST http://localhost:5000/api/upcoming/admin/sync`
- Auto-repair trailer links: `POST http://localhost:5000/api/admin/trailer-diagnostics/re-scan`

---

## Troubleshooting Common Issues

### 1. `EADDRINUSE: address already in use`
A previously running process is occupying port 3000 or 5000.
- **Windows (PowerShell)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux**:
  ```bash
  kill -9 $(lsof -t -i:3000)
  kill -9 $(lsof -t -i:5000)
  ```

### 2. Node Version Mismatch
If you encounter runtime syntax errors, ensure you are running Node.js 20+:
```bash
nvm use 20
```

### 3. Missing Third-Party Keys
If you do not have TMDB or YouTube API keys, CineSense automatically operates using its built-in catalog with verified trailers for popular films (e.g. *Toxic*, *Jana Nayagan*, *Inception*).

---

## Security Note: API Key Rotation
If any personal TMDB tokens or database credentials were committed to git history in earlier development iterations, ensure you generate fresh tokens in your [TMDB Account Settings](https://www.themoviedb.org/settings/api) and Supabase console. All source code in this repository now strictly accesses keys through `process.env`.
