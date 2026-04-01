import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createPrintSettings, getPrintSettingsBySession, updatePrintSettings } from "../db/crud/printsettings.crud.js";
import { getJobsBySession, updatePrintJobPricing } from "../db/crud/printjob.crud.js";
import { calculatePrintCost } from "../utils/pricing.js";
import { getActiveSessionFromDB } from "../db/crud/session.crud.js";
import { v4 as uuidv4 } from "uuid";


export const createSettings = asyncHandler(async (req, res) => {
  const { session_id, settings } = req.body;
  console.log("Received settings:", settings);
  console.log("Received session_id:", session_id);
  if (!session_id || !settings) {
    throw new ApiError(400, "session_id and settings are required");
  }

  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  const existing = await getPrintSettingsBySession(session_id);
  if (existing.length > 0) {
    throw new ApiError(409, "Print settings already exist for this session");
  }

  const settingsRecord = {
    id: uuidv4(),
    session_id,
    color_mode: (settings.color_mode ?? "BW").toUpperCase(),
    copies: settings.copies ?? 1,
    paper_size: (settings.paper_size ?? "A4").toUpperCase(),
    sides: (settings.sides ?? "SINGLE").toUpperCase(),
    orientation: (settings.orientation ?? "PORTRAIT").toUpperCase()
  };

  await createPrintSettings(settingsRecord);
  console.log("Created settings:", settingsRecord);

  return res.status(201).json(
    new ApiResponse("Settings created successfully", settingsRecord, 201)
  );
});



export const updateSettings = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  const { settings } = req.body;

  if (!session_id || !settings) {
    throw new ApiError(400, "session_id and settings are required");
  }

  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }

  // 🔹 fetch existing settings
  const existing = await getPrintSettingsBySession(session_id);
  if (!existing || existing.length === 0) {
    throw new ApiError(404, "Print settings not found");
  }

  const current = existing[0];

  const settingsRecord = {
    id: current.id,                       // ✅ EXISTING ID
    color_mode: (settings.color_mode ?? current.color_mode).toUpperCase(),
    copies: settings.copies ?? current.copies,
    paper_size: (settings.paper_size ?? current.paper_size).toUpperCase(),
    sides: (settings.sides ?? current.sides).toUpperCase(),
    orientation: (settings.orientation ?? current.orientation).toUpperCase()
  };

  await updatePrintSettings(settingsRecord);

  // 🔄 RECALCULATE PRICES for all pending jobs
  // Since we changed settings (Color/Copies/Size), the price is now different.
  const sessionJobs = getJobsBySession(session_id);

  for (const job of sessionJobs) {
    if (job.status !== 'PENDING') continue;

    try {
      const { price_per_page, cost } = calculatePrintCost({
        color_mode: settingsRecord.color_mode,
        paper_size: settingsRecord.paper_size,
        pages: job.pages,
        copies: settingsRecord.copies
      });

      updatePrintJobPricing({
        id: job.id,
        copies: settingsRecord.copies,
        price_per_page,
        cost
      });
    } catch (err) {
      console.error(`Failed to recalc price for job ${job.id}:`, err);
    }
  }

  return res.status(200).json(
    new ApiResponse("Settings updated and prices recalculated", settingsRecord, 200)
  );
});


export const getSettings = asyncHandler(async (req, res) => {
  const { session_id } = req.params;
  if (!session_id) {
    throw new ApiError(400, "session_id is required");
  }
  const session = await getActiveSessionFromDB(session_id);
  if (!session) {
    throw new ApiError(401, "Session expired or invalid");
  }
  const settings = await getPrintSettingsBySession(session_id);
  return res.status(200).json(
    new ApiResponse("Settings fetched successfully", settings.length ? settings[0] : null, 200)
  )
});