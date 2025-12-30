import fs from "fs";
import path from "path";
import os from "os";
import db from "../db/connection.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * HEALTH CHECK
 * Used by desktop app / monitoring
 */
export const healthCheck = asyncHandler((req, res) => {
    return res.status(200).json(
        new ApiResponse("Server is healthy", {
            uptime: process.uptime(),
            memory: process.memoryUsage().rss,
            platform: process.platform,
            timestamp: new Date().toISOString()
        }, 200)
    );
});

/**
 * CLEANUP OLD / STALE SESSIONS
 * Marks abandoned ACTIVE sessions as CLOSED
 */
export const cleanupSessions = asyncHandler((req, res) => {
    const result = db.prepare(`
        UPDATE sessions
        SET status = 'CLOSED'
        WHERE status = 'ACTIVE'
        AND created_at < DATETIME('now', '-6 hours')
    `).run();

    return res.status(200).json(
        new ApiResponse("Old sessions cleaned", {
            closed_sessions: result.changes
        }, 200)
    );
});

/**
 * GET ACTIVE SESSIONS
 * Admin / dashboard usage
 */
export const getActiveSessions = asyncHandler((req, res) => {
    const sessions = db.prepare(`
        SELECT id, customer_name, created_at
        FROM sessions
        WHERE status = 'ACTIVE'
        ORDER BY created_at DESC
    `).all();

    return res.status(200).json(
        new ApiResponse("Active sessions fetched", sessions, 200)
    );
});

/**
 * GET AUDIT LOGS
 * System-level debugging & traceability
 */
export const getAuditLogs = asyncHandler((req, res) => {
    const logs = db.prepare(`
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 100
    `).all();

    return res.status(200).json(
        new ApiResponse("Audit logs fetched", logs, 200)
    );
});

/**
 * GET STORAGE INFO
 * Disk usage for uploads folder
 */
export const getStorageInfo = asyncHandler((req, res) => {
    const uploadsDir = path.join(process.cwd(), "uploads");

    let totalSize = 0;
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
            const stats = fs.statSync(path.join(uploadsDir, file));
            if (stats.isFile()) {
                totalSize += stats.size;
            }
        }
    }

    const disk = os.freemem();

    return res.status(200).json(
        new ApiResponse("Storage info fetched", {
            uploads_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
            free_memory_mb: (disk / (1024 * 1024)).toFixed(2)
        }, 200)
    );
});

/**
 * FORCE END SESSION
 * Emergency admin action
 */
export const forceEndSession = asyncHandler((req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        throw new ApiError(400, "session_id is required");
    }

    const result = db.prepare(`
        UPDATE sessions
        SET status = 'CLOSED'
        WHERE id = ? AND status = 'ACTIVE'
    `).run(session_id);

    if (result.changes === 0) {
        throw new ApiError(404, "Session not found or already closed");
    }

    return res.status(200).json(
        new ApiResponse("Session forcefully closed", null, 200)
    );
});
