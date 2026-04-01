import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    createPrintJob,
    markJobPrinted,
    cancelPrintJob,
    failPrintJob,
    getJobsBySession
} from "../db/crud/printjob.crud.js";
import { sendToPrinter } from "../utils/printer.js";
import { getPrintJobById } from "../db/crud/printjob.crud.js";
import { calculatePrintCost } from "../utils/pricing.js";
import { calculatePageCount } from "../utils/pageCount.js";
import { v4 as uuidv4 } from "uuid";
import db from "../db/connection.js";



/**
 * CREATE PRINT JOB
 * Called after:
 * - file upload
 * - settings saved
 * - pricing calculated
 */
export const createPrintJobsController = asyncHandler(async (req, res) => {
    console.log("👉 createPrintJobsController called");
    console.log("👉 Body:", JSON.stringify(req.body, null, 2));
    const {
        files,          // array
        settings_id,
        copies,
        color_mode,
        paper_size
    } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
        throw new ApiError(400, "Files array is required");
    }

    if (!settings_id || !copies || !color_mode || !paper_size) {
        throw new ApiError(400, "Missing required fields");
    }

    const createdJobs = [];

    for (const file of files) {
        const { file_id, file_path } = file;

        if (!file_id || !file_path) {
            throw new ApiError(400, "Invalid file data");
        }

        // 📄 Page count (per file)
        const pages = await calculatePageCount(file_path);

        // 💰 Pricing (per file)
        const { price_per_page, cost } = calculatePrintCost({
            color_mode,
            paper_size,
            pages,
            copies
        });

        const jobId = uuidv4();

        createPrintJob({
            id: jobId,
            file_id,
            settings_id,
            pages,
            copies,
            price_per_page,
            cost
        });

        createdJobs.push({
            job_id: jobId,
            file_id,
            pages,
            cost
        });
    }

    return res.status(201).json(
        new ApiResponse("Print jobs created", createdJobs, 201)
    );
});


/**
 * MARK JOB AS PRINTED
 */
export const printJobController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = getPrintJobById(id);
    if (!job || job.status !== "PENDING") {
        throw new ApiError(409, "Job cannot be printed");
    }

    try {
        await sendToPrinter(job.file_path, job.copies);
        markJobPrinted(id);
    } catch (err) {
        failPrintJob(id);
        throw err;
    }

    res.json(new ApiResponse("Print successful", null, 200));
});

/**
 * CANCEL JOB (ONLY IF PENDING)
 */
export const cancelPrintJobController = asyncHandler((req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Job ID required");
    }

    const result = cancelPrintJob(id);

    if (result.changes === 0) {
        throw new ApiError(409, "Job cannot be cancelled");
    }

    return res.status(200).json(
        new ApiResponse("Print job cancelled", null, 200)
    );
});

/**
 * MARK JOB AS FAILED
 */
export const failPrintJobController = asyncHandler((req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Job ID required");
    }

    const result = failPrintJob(id);

    if (result.changes === 0) {
        throw new ApiError(409, "Job cannot be marked as FAILED");
    }

    return res.status(200).json(
        new ApiResponse("Print job marked as FAILED", null, 200)
    );
});

/**
 * GET ALL JOBS FOR A SESSION
 * Used by shopkeeper dashboard
 */
export const getJobsBySessionController = asyncHandler((req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        throw new ApiError(400, "Session ID required");
    }

    const jobs = getJobsBySession(session_id);

    return res.status(200).json(
        new ApiResponse("Print jobs retrieved successfully", jobs, 200)
    );
});

/**
 * GET ALL PRINT JOBS (SHOP DASHBOARD)
 */
export const getAllPrintJobsController = asyncHandler((req, res) => {
    // Optional filter by status
    const { status } = req.query;

    let query = `
        SELECT
            pj.id,
            pj.file_id,
            pj.settings_id,
            pj.pages,
            pj.copies,
            pj.price_per_page,
            pj.cost,
            pj.status,
            pj.created_at,
            f.original_name as file_name,
            f.file_type,
            ps.color_mode,
            ps.paper_size,
            ps.sides,
            ps.orientation,
            COALESCE(c.name, 'Guest') as customer_name
        FROM print_jobs pj
        LEFT JOIN files f ON f.id = pj.file_id
        LEFT JOIN customers c ON c.id = f.customer_id
        LEFT JOIN print_settings ps ON ps.id = pj.settings_id
    `;

    const queryParams = [];

    if (status) {
        query += ` WHERE pj.status = ?`;
        queryParams.push(status);
    }

    query += ` ORDER BY pj.created_at DESC`;

    const jobs = db.prepare(query).all(...queryParams);

    return res.status(200).json(
        new ApiResponse("All print jobs fetched", jobs, 200)
    );
});

/**
 * PREVIEW PRINT JOB (Fallback)
 * Generates an HTML page with:
 * - Embedded file (Base64)
 * - CSS for settings (Grayscale, Page Size)
 * - Auto-print trigger
 */
export const previewPrintJobController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Get Job & Details
    const job = db.prepare(`
        SELECT 
            pj.*, 
            f.local_path, 
            f.file_type, 
            ps.color_mode, 
            ps.paper_size, 
            ps.orientation 
        FROM print_jobs pj
        LEFT JOIN files f ON f.id = pj.file_id
        LEFT JOIN print_settings ps ON ps.id = pj.settings_id
        WHERE pj.id = ?
    `).get(id);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    // 2. Read File as Base64
    let fileContent;
    try {
        const fs = await import("fs");
        fileContent = fs.readFileSync(job.local_path).toString("base64");
    } catch (err) {
        throw new ApiError(500, "Failed to read file for preview");
    }

    // 2.5 Mark as PRINTED (As requested: opening preview counts as success)
    try {
        markJobPrinted(id);
    } catch (err) {
        console.error("Failed to mark job as printed during preview:", err);
        // We continue to show preview even if DB update fails, but ideally it shouldn't
    }

    // 3. Construct HTML
    const isPDF = job.file_type.toLowerCase() === "pdf";
    const mimeType = isPDF ? "application/pdf" : `image/${job.file_type}`;
    const isBW = job.color_mode === "BW";

    const cssSize = job.paper_size.toLowerCase(); // a4, a3
    const cssOrientation = job.orientation.toLowerCase(); // portrait, landscape

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Print Preview - ${job.id}</title>
        <style>
            @page {
                size: ${cssSize} ${cssOrientation};
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                ${isBW ? 'filter: grayscale(100%);' : ''}
                height: 100vh;
            }
            img, embed, object {
                max-width: 100%;
                max-height: 100%;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        ${isPDF
            ? `<embed src="data:${mimeType};base64,${fileContent}" width="100%" height="100%" type="application/pdf">`
            : `<img src="data:${mimeType};base64,${fileContent}" />`
        }
        <script>
            // Auto-print after load
            window.onload = () => {
                setTimeout(() => {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
});

