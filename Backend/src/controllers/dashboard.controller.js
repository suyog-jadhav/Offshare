import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import db from "../db/connection.js";
import { cleanupExpiredSessions } from "../db/crud/session.crud.js";

/**
 * =========================
 * ACTIVE SESSIONS (Dashboard)
 * =========================
 * Shows active sessions + customer name (if any)
 */
export const getActiveSessions = asyncHandler((req, res) => {
    // Ensure expired sessions are marked inactive before fetching
    cleanupExpiredSessions();

    const sessions = db.prepare(`
        SELECT
            s.id AS session_id,
            d.device_name,
            d.device_type,
            COALESCE(c.name, 'Guest') AS customer_name,
            s.started_at,
            s.last_activity_at
        FROM sessions s
        LEFT JOIN devices d ON d.id = s.device_id
        LEFT JOIN files f ON f.session_id = s.id
        LEFT JOIN customers c ON c.id = f.customer_id
        WHERE s.is_active = 1
        GROUP BY s.id
        ORDER BY s.last_activity_at DESC
    `).all();

    return res.status(200).json(
        new ApiResponse("Active sessions fetched", sessions, 200)
    );
});

export const getTodayJobs = asyncHandler((req, res) => {
    const jobs = db.prepare(`
        SELECT
            pj.id AS job_id,
            f.original_name AS file_name,
            COALESCE(c.name, 'Guest') AS customer_name,
            pj.pages,
            pj.copies,
            pj.cost,
            pj.status,
            pj.created_at
        FROM print_jobs pj
        LEFT JOIN files f ON f.id = pj.file_id
        LEFT JOIN customers c ON c.id = f.customer_id
        -- WHERE DATE(pj.created_at) = DATE('now', 'localtime')
        ORDER BY pj.created_at DESC
        ${req.query.limit ? 'LIMIT ?' : ''}
    `).all(...(req.query.limit ? [req.query.limit] : []));

    console.log(`📋 Recent Activity: Found ${jobs.length} jobs`);
    if (jobs.length > 0) console.log("   Latest:", jobs[0]);

    return res.status(200).json(
        new ApiResponse("Today's print jobs fetched", jobs, 200)
    );
});

export const getTodayRevenue = asyncHandler((req, res) => {
    const revenue = db.prepare(`
        SELECT
            IFNULL(SUM(cost), 0) AS total_revenue,
            COUNT(*) AS printed_jobs
        FROM print_jobs
        WHERE status = 'PRINTED'
          AND DATE(created_at, 'localtime') = DATE('now', 'localtime')
    `).get();

    return res.status(200).json(
        new ApiResponse("Today's revenue fetched", revenue, 200)
    );
});

export const getDashboardStats = asyncHandler((req, res) => {
    // Ensure expired sessions are marked inactive before fetching stats
    cleanupExpiredSessions();

    const stats = db.prepare(`
        SELECT
            (SELECT COUNT(*) FROM sessions WHERE is_active = 1) AS active_sessions,
            (SELECT COUNT(*) FROM customers) AS total_customers,
            (SELECT COUNT(*) FROM print_jobs WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS total_jobs_today,
            (SELECT COUNT(*) FROM print_jobs WHERE status = 'PRINTED' AND DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS printed_today,
            (SELECT IFNULL(SUM(cost),0) FROM print_jobs WHERE status = 'PRINTED' AND DATE(created_at, 'localtime') = DATE('now', 'localtime')) AS revenue_today
    `).get();

    // Fetch Status Breakdown for "Jobs Overview"
    const statusStats = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM print_jobs 
        -- WHERE DATE(created_at, 'localtime') = DATE('now', 'localtime') -- Optional: if overview should be Today only
        GROUP BY status
    `).all();

    const responseData = {
        ...stats,
        jobs: {
            byStatus: statusStats
        }
    };

    console.log("📊 Stats Query Result:", stats);
    // Explicitly log the dates for debugging
    const dateCheck = db.prepare("SELECT DATE('now', 'localtime') as local_now").get();
    console.log("🕒 DB Local Time:", dateCheck);

    return res.status(200).json(
        new ApiResponse("Dashboard stats fetched", responseData, 200)
    );
});
