# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

erepmax is a personal strength-training tracker that logs sets and charts estimated one-rep max (e1RM) over time using the Epley formula. Built with Next.js 16, React 19, better-sqlite3, Recharts, and Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build (standalone output)
- `docker compose up --build` — run in Docker (exposed on port 6868, DB at `/data/erepmax.db`)

There are no lint or test scripts configured.

## Architecture

### Data flow

All data is stored in a single SQLite file (path from `DB_PATH` env var, default `./data/erepmax.db`). The database is accessed synchronously via `better-sqlite3` — no ORM. Migrations run inline on first connection (`src/lib/db.ts`). Weights are always stored in kg; conversion to lbs happens at display time.

### Key layers

- **`src/lib/db.ts`** — singleton DB connection, schema migrations, seed data (Squat, Bench Press, Deadlift, Overhead Press)
- **`src/lib/queries.ts`** — all SQL queries and TypeScript interfaces (`Exercise`, `SetRecord`, `OneRmRecord`, etc.)
- **`src/lib/oneRm.ts`** — Epley formula, unit conversion helpers (`toDisplayWeight`, `toKg`)
- **`src/context/UnitContext.tsx`** — client-side kg/lbs toggle persisted to localStorage

### API routes

All under `src/app/api/`:
- `POST /api/sets` — log a set (computes e1RM server-side); rejects duplicates per exercise+date
- `DELETE /api/sets?exerciseId=&date=` — delete sets for an exercise on a date
- `GET /api/exercises` / `POST /api/exercises` — list/create exercises
- `GET /api/records?exerciseId=` — per-exercise 1RM history (max e1RM per date)

### Pages

- `/` — dashboard with 1RM charts per exercise (server component, `force-dynamic`)
- `/log` — log set form
- `/exercises` — manage custom exercises

### Deployment

`next.config.ts` uses `output: 'standalone'`. The Dockerfile produces a minimal image running `node server.js`. Docker Compose mounts a volume at `/data` for the SQLite DB.
