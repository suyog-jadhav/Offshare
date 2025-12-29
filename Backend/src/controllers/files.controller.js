import { v4 as uuidv4 } from "uuid";
import path from "path";
import crypto from "crypto";
import fs from "fs";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { createFile , getFilesBySession,deleteFileById,getFileById} from "../db/crud/file.crud.js";
import { getActiveSessionFromDB } from "../db/crud/session.crud.js";

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
    throw new ApiError(400, "At least one file is required");
  }

  const savedFiles = [];

  // 3️⃣ Process each file
  for (const file of req.files) {
    const buffer = fs.readFileSync(file.path);
    const checksum = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const record = {
      id: uuidv4(),
      session_id,
      customer_id: customer_id || null,

      original_name: file.originalname,
      stored_name: file.filename,
      file_type: path.extname(file.originalname).replace(".", ""),
      file_size: file.size,
      checksum,
      local_path: file.path
    };

    await createFile(record);
    savedFiles.push(record);
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