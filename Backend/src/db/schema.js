import db from "./connection.js";

/*
  OFFLINE XEROX DATABASE SCHEMA (FINAL)
  -----------------------------------
  - Pure offline
  - QR + hotspot based
  - Session + heartbeat support
  - Android disconnect safe
  - Correct page count & pricing model
*/

db.exec(`
-- =========================
-- SHOP (single shop info)
-- =========================
CREATE TABLE IF NOT EXISTS shop (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    local_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DEVICES (connected clients)
-- =========================
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    device_name TEXT,
    device_type TEXT,          -- android / ios / laptop
    local_ip TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP

);

-- =========================
-- SESSIONS (offline lifecycle)
-- =========================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,

    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,

    ended_at DATETIME,
    is_active INTEGER DEFAULT 1,

    FOREIGN KEY (device_id) REFERENCES devices(id)
);


-- =========================
-- CUSTOMERS (optional)
-- =========================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    is_guest INTEGER DEFAULT 1,
    total_jobs INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FILES (uploaded documents)
-- =========================
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    customer_id TEXT,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    file_type TEXT,           -- pdf / jpg / docx
    file_size INTEGER,
    checksum TEXT,
    local_path TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_printed INTEGER DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- =========================
-- PRINT SETTINGS
-- =========================
CREATE TABLE IF NOT EXISTS print_settings (
    id TEXT PRIMARY KEY,
    color_mode TEXT,          -- BW / COLOR
    copies INTEGER NOT NULL,
    paper_size TEXT,          -- A4 / A3
    sides TEXT,               -- SINGLE / DOUBLE
    orientation TEXT,         -- PORTRAIT / LANDSCAPE
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- =========================
-- PRINT PRICING (shop config)
-- =========================
CREATE TABLE IF NOT EXISTS print_pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    color_mode TEXT NOT NULL,     -- BW / COLOR
    paper_size TEXT NOT NULL,     -- A4 / A3
    price_per_page REAL NOT NULL
);

-- =========================
-- PRINT JOBS (FINAL BILLING SOURCE)
-- =========================
CREATE TABLE IF NOT EXISTS print_jobs (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    settings_id TEXT NOT NULL,

    pages INTEGER NOT NULL,           -- detected page count
    copies INTEGER NOT NULL,          -- snapshot from settings
    price_per_page REAL NOT NULL,     -- snapshot at print time
    cost REAL NOT NULL,               -- pages × copies × price

    status TEXT,                      -- PENDING / PRINTED / FAILED
    printed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (settings_id) REFERENCES print_settings(id)
);

-- =========================
-- PAYMENTS (offline)
-- =========================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    print_job_id TEXT NOT NULL,
    method TEXT,                      -- CASH / UPI
    amount REAL NOT NULL,
    status TEXT,                      -- PAID / UNPAID
    paid_at DATETIME,
    FOREIGN KEY (print_job_id) REFERENCES print_jobs(id)
);

-- =========================
-- AUDIT LOGS (debugging)
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT,                       -- INFO / ERROR
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- =========================
-- INDEXES (performance)
-- =========================
CREATE INDEX IF NOT EXISTS idx_sessions_active
ON sessions (is_active, last_activity_at);

CREATE INDEX IF NOT EXISTS idx_files_session
ON files (session_id);

CREATE INDEX IF NOT EXISTS idx_print_jobs_status
ON print_jobs (status);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry
ON sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_pricing_lookup
ON print_pricing (color_mode, paper_size);
`);

console.log("✅ Offline Xerox DB schema initialized (FINAL)");
