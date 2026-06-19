# SCMS Indent Portal

Supply Chain Management System — Indent (purchase requisition) portal.
FastAPI backend backed by PostgreSQL, with a React/Vite frontend.

All indent and line-item data is stored in PostgreSQL (`scms` schema).
Approval/rejection events also write to `public.notifications`, which the
backend now creates automatically if it doesn't already exist.

## Quickest start: Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL and the backend together. The backend creates its
schema and tables automatically on first boot — no manual SQL step needed.
API available at `http://localhost:8001` (docs at `/docs`).

## Manual setup

### 1. PostgreSQL

Create a database (any name, `scms` is just the convention):

```bash
createdb scms
```

You do **not** need to run `backend/setup.sql` by hand — the backend runs it
automatically (idempotently) every time it starts.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set ASYNC_DATABASE_URL to your Postgres connection string
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8001
```

> `ASYNC_DATABASE_URL` is required. The app now fails fast with a clear
> message instead of crashing with a cryptic stack trace if it's missing.

Visit `http://localhost:8001/health` to confirm it's up, and
`http://localhost:8001/docs` for interactive API docs.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8001
npm install
npm run dev             # http://localhost:5173
```

The frontend talks to the backend via `frontend/src/api.js`. If the backend
is unreachable it falls back to local demo data (and shows a banner saying
so) so the UI is still browsable — but nothing in that fallback mode is
persisted. For real, durable data, the backend + Postgres must be running.

To serve the frontend from the backend itself (single process), build it
and point the backend at the output:

```bash
cd frontend && npm run build   # outputs to frontend/dist
cd ../backend && uvicorn backend.main:app --port 8001
# STATIC_DIR defaults to frontend/dist, so the built UI is served at "/"
```

## What was fixed

- **App crashed on startup with no `.env`.** `database.py` built a sync
  SQLAlchemy engine from an always-unset `DATABASE_URL` (it was dead code —
  nothing used it), which raised a raw `ArgumentError` before the server
  could even start. Removed the unused engine; the app now fails with a
  clear, actionable message if `ASYNC_DATABASE_URL` isn't set.
- **Database schema was never created automatically.** `backend/setup.sql`
  had to be run by hand against Postgres, and the `public.notifications`
  table wasn't created anywhere at all. The backend now runs both
  automatically (idempotently) on every startup via `init_db()`.
- **Notifications were silently lost.** `notify_helper.py` had its
  `db.commit()` commented out, so every approval/rejection/creation
  notification was written to the session and then rolled back when the
  connection closed — it never actually reached Postgres. Fixed.
- **`GET /api/indent/{id}/items` didn't 404 for a missing indent** — it
  silently returned `[]`, indistinguishable from "indent exists but has no
  items." Now returns 404 as documented.
- **Static-file route was unreachable in practice.** The `/health` route and
  the API router were registered *before* `app.mount("/", StaticFiles(...))`
  on the same path prefix, so once a built frontend was present the catch-all
  mount could shadow `/health`/API routes. Routing order fixed: the static
  mount is now registered last. The dead `FileResponse("static/index.html")`
  fallback route (pointing at a path that never existed) was removed since
  `StaticFiles(html=True)` already serves `index.html` at `/`.
- Added `backend/.env.example`, `docker-compose.yml`, and `backend/Dockerfile`
  so the project runs with zero manual configuration beyond a connection
  string.

## API reference

See `backend/routes/indent.py` for the full route implementations, or run
the server and open `/docs` for live, interactive documentation generated
from the Pydantic schemas.
