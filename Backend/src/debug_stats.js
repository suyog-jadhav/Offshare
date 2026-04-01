
import db from "./db/connection.js";

console.log("=== DEBUGGING DATABASE STATS ===");

// 1. Check Current Time & Localtime
const timeCheck = db.prepare("SELECT datetime('now') as active_utc, datetime('now', 'localtime') as active_local, date('now', 'localtime') as date_local").get();
console.log("Time Check:", timeCheck);

// 2. Check Sessions
const sessions = db.prepare("SELECT count(*) as total, sum(is_active) as active FROM sessions").get();
console.log("Sessions:", sessions);
const sampleSession = db.prepare("SELECT * FROM sessions LIMIT 1").get();
console.log("Sample Session:", sampleSession);

// 3. Check Customers
const customers = db.prepare("SELECT count(*) as total FROM customers").get();
console.log("Customers:", customers);

// 4. Check Print Jobs & Dates
const jobs = db.prepare("SELECT count(*) as total FROM print_jobs").get();
console.log("Total Print Jobs:", jobs);

const sampleJob = db.prepare(`
    SELECT 
        created_at, 
        date(created_at) as date_utc, 
        date(created_at, 'localtime') as date_local 
    FROM print_jobs 
    ORDER BY created_at DESC 
    LIMIT 3
`).all();
console.log("Sample Jobs Dates:", sampleJob);

// 5. Test the EXACT dashboard query
const stats = db.prepare(`
    SELECT
        (SELECT COUNT(*) FROM sessions WHERE is_active = 1) AS active_sessions,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM print_jobs WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS total_jobs_today,
        (SELECT COUNT(*) FROM print_jobs WHERE status = 'PRINTED' AND DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS printed_today,
        (SELECT IFNULL(SUM(cost),0) FROM print_jobs WHERE status = 'PRINTED' AND DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS revenue_today
`).get();
console.log("DASHBOARD QUERY RESULT:", stats);
