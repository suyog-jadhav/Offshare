import { Router } from "express";
import db from "../db/connection.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// GET /overview - Summary Stats
router.get("/overview", async (req, res) => {
    try {
        const revenueQuery = db.prepare("SELECT SUM(cost) as total FROM print_jobs WHERE status = 'PRINTED'").get();
        const jobsQuery = db.prepare("SELECT COUNT(*) as total FROM print_jobs").get();
        const customersQuery = db.prepare("SELECT COUNT(*) as total FROM customers").get();

        // Calculate average order value
        const totalRevenue = revenueQuery?.total || 0;
        const totalPrintedJobs = db.prepare("SELECT COUNT(*) as total FROM print_jobs WHERE status = 'PRINTED'").get()?.total || 1;
        const avgOrderValue = totalRevenue / (totalPrintedJobs || 1);

        res.status(200).json(new ApiResponse("Overview stats fetched", {
            totalRevenue,
            totalJobs: jobsQuery?.total || 0,
            totalCustomers: customersQuery?.total || 0,
            avgOrderValue: avgOrderValue.toFixed(2)
        }));
    } catch (error) {
        console.error("Analytics Overview Error:", error);
        throw new ApiError(500, "Failed to fetch overview stats");
    }
});

// GET /revenue-chart - Last 30 Days Revenue Trend
router.get("/revenue-chart", async (req, res) => {
    try {
        const query = `
            SELECT 
                date(created_at, 'localtime') as date, 
                SUM(cost) as revenue, 
                COUNT(*) as jobs 
            FROM print_jobs 
            WHERE status = 'PRINTED' 
            GROUP BY date(created_at, 'localtime') 
            ORDER BY date(created_at, 'localtime') DESC 
            LIMIT 30
        `;
        const data = db.prepare(query).all();

        // Reverse to show oldest first for charts
        res.status(200).json(new ApiResponse("Revenue chart data fetched", data.reverse()));
    } catch (error) {
        console.error("Analytics Revenue Chart Error:", error);
        throw new ApiError(500, "Failed to fetch revenue chart data");
    }
});

// GET /status-distribution - Job Status Breakdown
router.get("/status-distribution", async (req, res) => {
    try {
        const query = "SELECT status, COUNT(*) as count FROM print_jobs GROUP BY status";
        const data = db.prepare(query).all();
        res.status(200).json(new ApiResponse("Status distribution fetched", data));
    } catch (error) {
        console.error("Analytics Status Dist Error:", error);
        throw new ApiError(500, "Failed to fetch status distribution");
    }
});

// GET /file-type-distribution - File Type Breakdown
router.get("/file-type-distribution", async (req, res) => {
    try {
        // We look at files table, maybe only those that were printed or all uploaded?
        // Let's look at all files to see upload trends
        const query = "SELECT file_type, COUNT(*) as count FROM files GROUP BY file_type";
        const data = db.prepare(query).all();
        res.status(200).json(new ApiResponse("File type distribution fetched", data));
    } catch (error) {
        console.error("Analytics File Type Dist Error:", error);
        throw new ApiError(500, "Failed to fetch file type distribution");
    }
});

export default router;
