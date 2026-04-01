import { v4 as uuidv4 } from "uuid";
import path from "path";
import crypto from "crypto";
import fs from "fs";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { createFile, getFilesBySession, deleteFileById, getFileById } from "../db/crud/file.crud.js";
import { getCustomerById } from "../db/crud/customer.crud.js";
import { createPrintJob } from "../db/crud/printjob.crud.js";
import { createPrintSettings, getPrintSettingsBySession } from "../db/crud/printsettings.crud.js";
import { calculatePageCount } from "../utils/pageCount.js";
import { calculatePrintCost } from "../utils/pricing.js";
import { getActiveSessionFromDB, updateHeartbeatInDB } from "../db/crud/session.crud.js";


export const uploadFiles = asyncHandler(async (req, res) => {
  const { session_id, customer_id } = req.body;

  // 1️⃣ Validate session
  if (!session_id) {
    throw new ApiError(400, "session_id is required");
  }

  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  // 2️⃣ Validate files
  if (!req.files || req.files.length === 0) {
    console.error("❌ No files received");
    throw new ApiError(400, "No files uploaded");
  }

  if (customer_id) {
    const customer = await getCustomerById(customer_id);
    if (!customer) {
      console.warn(`⚠️ Invalid customer_id ${customer_id}, defaulting to NULL`);
      // You can either throw error or default to null. Defaulting to null is safer for upload success.
      // req.body.customer_id = null; // Can't easily mutate const destructured.
      // We will handle it in the record object creation.
    }
  }

  const savedFiles = [];

  // 3️⃣ Process each file
  for (const file of req.files) {
    const buffer = await fs.readFileSync(file.path);
    const checksum = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const fileId = uuidv4(); // Generate file ID once
    const record = {
      id: fileId,
      session_id,
      customer_id: (customer_id && await getCustomerById(customer_id)) ? customer_id : null,

      original_name: file.originalname,
      stored_name: file.filename,
      file_type: path.extname(file.originalname).replace(".", ""),
      file_size: file.size,
      checksum,
      local_path: file.path
    };

    await createFile(record);

    // Auto-create Print Job for visibility
    try {
      let pages = 1;
      try {
        pages = await calculatePageCount(file.path);
      } catch (err) {
        console.warn(`⚠️ Page count failed for ${file.originalname}, defaulting to 1. Error: ${err.message}`);
      }

      // 💰 Defaults - will be recalculated below based on settings


      // ⚙️ Settings Logic: Reuse existing session settings or create default
      let settingsId;
      let settingsToUse = {
        color_mode: "BW",
        paper_size: "A4",
        copies: 1,
        sides: "SINGLE",
        orientation: "PORTRAIT"
      };

      const existingSettings = await getPrintSettingsBySession(session_id);

      if (existingSettings && existingSettings.length > 0) {
        // Reuse existing
        const current = existingSettings[0];
        settingsId = current.id;
        settingsToUse = {
          color_mode: current.color_mode,
          paper_size: current.paper_size,
          copies: current.copies,
          sides: current.sides,
          orientation: current.orientation
        };
      } else {
        // Create new default
        settingsId = uuidv4();
        try {
          await createPrintSettings({
            id: settingsId,
            session_id,
            ...settingsToUse
          });
        } catch (settingsErr) {
          console.error("Settings creation failed:", settingsErr);
          throw settingsErr;
        }
      }

      // 💰 Calculate Cost using the DETERMINED settings (either reused or default)
      const { price_per_page, cost } = calculatePrintCost({
        color_mode: settingsToUse.color_mode,
        paper_size: settingsToUse.paper_size,
        pages,
        copies: settingsToUse.copies
      });

      const jobId = uuidv4();

      await createPrintJob({
        id: jobId,
        file_id: fileId,
        settings_id: settingsId,
        pages,
        copies: settingsToUse.copies,
        price_per_page,
        cost
      });
      console.log(`✅ Auto-created Job ${jobId} for File ${fileId}`);
    } catch (jobErr) {
      console.error("❌ CRITICAL: Failed to auto-create job:", jobErr);
      console.error("Stack:", jobErr.stack);
      // Don't fail the upload if job creation fails, but log it
    }

    savedFiles.push(record);
  }

  // 💓 Extend Session Heartbeat
  try {
    updateHeartbeatInDB(session_id);
  } catch (hbErr) {
    console.warn("Heartbeat update failed:", hbErr);
  }

  return res.status(201).json(
    new ApiResponse("Files uploaded successfully", savedFiles, 201)
  );
});


export const getFilesForSession = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  if (!session_id) {
    throw new ApiError(400, "session_id is required");
  }

  // 🔒 Validate session before fetching files
  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  const files = await getFilesBySession(session_id);

  return res.status(200).json(
    new ApiResponse("Files fetched successfully", files, 200)
  );
});

export const deleteSessionFileById = asyncHandler(async (req, res) => {
  const { id, session_id } = req.params;

  if (!id || !session_id) {
    throw new ApiError(400, "File ID and session ID are required");
  }

  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  const file = await getFileById(id);
  if (!file || file.session_id !== session_id) {
    throw new ApiError(403, "File does not belong to this session");
  }

  // Delete file from disk
  if (fs.existsSync(file.local_path)) {
    fs.unlinkSync(file.local_path);
  }

  // Delete DB record
  await deleteFileById(id);

  return res.status(200).json(
    new ApiResponse("File deleted successfully", null, 200)
  );
});