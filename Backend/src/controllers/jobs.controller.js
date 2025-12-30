import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    createPrintJob,
    markJobPrinted,
    cancelPrintJob,
    failPrintJob,
    getJobsBySession
} from "../db/crud/printJobs.crud.js";
import { sendToPrinter } from "../services/printer.service.js";
import { getPrintJobById } from "../db/crud/printJobs.crud.js";


/**
 * CREATE PRINT JOB
 * Called after:
 * - file upload
 * - settings saved
 * - pricing calculated
 */
export const createPrintJobsController = asyncHandler(async (req, res) => {
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
