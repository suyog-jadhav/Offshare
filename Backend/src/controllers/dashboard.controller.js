import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import db from "../db/connection.js";

/**
 * GET ACTIVE SESSIONS
 * Used by shop dashboard
 */
export const getActiveSessions = asyncHandler((req, res) => {
    const sessions = db.prepare(`
        SELECT 
            id,
            customer_name,
            created_at
        FROM sessions
        WHERE status = 'ACTIVE'
        ORDER BY created_at DESC
    `).all();

    return res.status(200).json(
        new ApiResponse("Active sessions fetched", sessions, 200)
    );
});

/**
 * GET TODAY'S PRINT JOBS
 */
export const getTodayJobs = asyncHandler((req, res) => {
    const jobs = db.prepare(`
        SELECT 
            pj.id,
            pj.file_id,
            pj.pages,
            pj.copies,
            pj.cost,
            pj.status,
            pj.created_at
        FROM print_jobs pj
        WHERE DATE(pj.created_at) = DATE('now', 'localtime')
        ORDER BY pj.created_at DESC
    `).all();

    return res.status(200).json(
        new ApiResponse("Today's jobs fetched", jobs, 200)
    );
});

/**
 * GET TODAY'S REVENUE
 * Only PRINTED jobs count
 */
export const getTodayRevenue = asyncHandler((req, res) => {
    const revenue = db.prepare(`
        SELECT 
            IFNULL(SUM(cost), 0) AS total_revenue
        FROM print_jobs
        WHERE status = 'PRINTED'
        AND DATE(created_at) = DATE('now', 'localtime')
    `).get();

    return res.status(200).json(
        new ApiResponse("Today's revenue fetched", revenue, 200)
    );
});
