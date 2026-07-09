# Offshare — Project Documentation

Generated: February 6, 2026

## Project Overview
- **Name:** Offshare
- **Purpose:** Offline-first printing kiosk / small-shop print management system with a web dashboard and optional Electron wrapper. It allows devices to create sessions, upload files, auto-create print jobs, and handle offline payments and reconciliation.

## High-level Architecture

- Backend: Node.js + Express (API, file uploads, print job management, local SQLite DB). See [Backend/app.js](Backend/app.js).
- Database: SQLite (better-sqlite3) using a single file `offline_xerox.db`. Schema initialized in [Backend/src/db/schema.js](Backend/src/db/schema.js).
- Frontend: React + Vite single-page admin dashboard (HashRouter). Source in [Frontend/Frontend/src](Frontend/Frontend/src). Communicates via REST to the backend.
- Electron: Thin wrapper that launches the backend and loads the frontend static build. See [Electron/main.js](Electron/main.js).

Flow summary:
- Electron (optional) starts the backend process and loads the frontend UI.
- Devices (mobile/desktop) connect via local network QR/hotspot and create sessions with the backend.
- Devices upload files via `/api/files/upload`. Backend stores files on disk and records metadata in SQLite.
- Backend auto-creates print jobs from uploads and calculates costs using pricing tables.

## Key Components & Files

- Backend entry: [Backend/index.js](Backend/index.js)
- Backend app: [Backend/app.js](Backend/app.js)
- DB schema & initialization: [Backend/src/db/schema.js](Backend/src/db/schema.js)
- DB connection: [Backend/src/db/connection.js](Backend/src/db/connection.js)
- Upload controller: [Backend/src/controllers/files.controller.js](Backend/src/controllers/files.controller.js)
- Routes: [Backend/src/routes](Backend/src/routes) (shop, session, files, print, dashboard, system, qr, customer, analytics)
- Frontend entry: [Frontend/Frontend/src/App.jsx](Frontend/Frontend/src/App.jsx)
- Frontend API client: [Frontend/Frontend/src/services/api.js](Frontend/Frontend/src/services/api.js)
- Electron launcher: [Electron/main.js](Electron/main.js)

## Database Schema (summary)
Defined in [Backend/src/db/schema.js](Backend/src/db/schema.js). Main tables:

- `shop` — single-row shop info (id, name, wifi creds, local_ip).
- `devices` — connected client devices (id, name, local_ip, timestamps).
- `sessions` — session lifecycle and expiry tracking (id, device_id, started_at, expires_at, is_active).
- `customers` — optional customer records (id, name, phone, totals).
- `files` — uploaded documents metadata (id, session_id, original_name, stored_name, local_path, uploaded_at).
- `print_settings` — settings used for a print (color_mode, paper_size, copies, sides).
- `print_pricing` — pricing table seeded with default values.
- `print_jobs` — final billing records for prints (file_id, settings_id, pages, cost, status).
- `payments` — payments for print jobs.
- `audit_logs` — simple logging table.

Indexes exist for sessions expiry, files by session, print job status, and pricing lookup.

## Backend API (summary)
All endpoints are mounted under `/api` in [Backend/app.js](Backend/app.js).

Major route groups and notable endpoints:

- `/api/shop`
  - `POST /api/shop` — create initial shop config (no auth)
  - `GET /api/shop` — get shop config
  - `PUT /api/shop` — update (protected by shop auth)
  - `DELETE /api/shop` — delete (protected)

- `/api/session`
  - `POST /api/session/start` — start a session (device request)
  - `POST /api/session/heartbeat` — keep session alive
  - `POST /api/session/end` — shop/system ends session (shop auth required)
  - `GET /api/session` — (shop auth) list sessions

- `/api/files`
  - `POST /api/files/upload` — multipart upload of files (uses multer). Requires `session_id` in body; validates active session.
  - `GET /api/files/session/:session_id` — list files for a session
  - `DELETE /api/files/session/:session_id/file/:id` — delete a file (validates session)

- `/api/print` — print job operations (create, list, print, cancel, etc.)
- `/api/pricing` — pricing CRUD and lookup
- `/api/dashboard` — dashboard metrics (e.g., `/dashboard/sessions/active`, `/dashboard/jobs/today`, `/dashboard/revenue/today`, `/dashboard/stats`)
- `/api/customer` — customers CRUD and stats
- `/api/system` — health, cleanup, logs, storage info
- `/api/qr` and `/api/analytics` — QR and analytics endpoints

Implementation notes:
- Many routes use middlewares: `shopAuth.middleware.js`, `sessionValidation.middleware.js`, and `multer.middleware.js` for uploads.
- Error handling uses `ApiError` and a global error handler in `app.js`.

## File Storage
- Uploaded files are stored on disk by multer; the DB stores `local_path`.
- `files.controller` computes checksum and stores metadata, then triggers auto print-job creation.

## Pricing & Print Cost Calculation
- Pricing is stored in `print_pricing` and seeded with example values.
- Cost calculation logic is implemented in `Frontend` and backend utils (`src/utils/pricing.js` and `src/controllers/files.controller.js` uses `calculatePrintCost`).

## Environment & Config
- Backend reads `.env` via `dotenv` in [Backend/index.js](Backend/index.js). Typical variables:
  - `PORT` — server port (default 8000)

## Running the Project (development)

Backend (Windows PowerShell):
```powershell
cd Backend
npm install
npm run dev   # uses nodemon (index.js)
```

Frontend (dashboard):
```powershell
cd Frontend/Frontend
npm install
npm run dev   # starts Vite dev server
```

Electron wrapper (starts backend then loads frontend build):
```powershell
cd Electron
npm install
npm start
```

To build production frontend and run via Electron:
```powershell
cd Frontend/Frontend
npm run build
cd ../..  # back to workspace root
npm --prefix Electron install
npm --prefix Electron start  # Electron loads Frontend/Frontend/dist
```

## Development utilities & background tasks
- `index.js` sets up a periodic cleanup (session cleanup) every 60 seconds using `cleanupExpiredSessions`.

## Security & Auth
- Simple shop-level auth is implemented via `verifyShopAuth` middleware that checks headers (see API client in frontend that sends `shop_id` and `x-shop-token`).
- This project is intended for local/offline deployments; tokens are simple and should be improved for production.

## Testing & Debugging
- Backend logging is verbose; `app.js` prints requests with timestamps and user-agent.
- Use Postman or the frontend to exercise endpoints. File uploads use `multipart/form-data` field `files`.

## Deployment suggestions
- For an offline kiosk, run the Electron wrapper on a local machine that bridges Wi-Fi to the devices.
- For small LAN deployments, host backend on a local server (static IP) and serve frontend via static files.
- Backup `offline_xerox.db` regularly; implement a simple export/import for recovery.

## Extensibility ideas
- Add token-based authentication and refresh tokens for shop admin.
- Add background worker queue for printing & retrying failed jobs.
- Add optional remote sync to a cloud endpoint for central reporting.

## Useful file references
- Backend entry: [Backend/index.js](Backend/index.js)
- App config: [Backend/app.js](Backend/app.js)
- DB schema: [Backend/src/db/schema.js](Backend/src/db/schema.js)
- Uploads controller: [Backend/src/controllers/files.controller.js](Backend/src/controllers/files.controller.js)
- Frontend API client: [Frontend/Frontend/src/services/api.js](Frontend/Frontend/src/services/api.js)
- Electron launcher: [Electron/main.js](Electron/main.js)

## Maintenance notes
- Keep `print_pricing` consistent when changing pricing logic.
- Ensure `multer` storage directory is writable and rotated if storage is limited.

---
