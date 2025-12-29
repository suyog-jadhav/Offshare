import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import {
  uploadFiles,
  getFilesForSession,
  deleteSessionFileById
} from "../controllers/file.controller.js";

const router = Router();

// Upload multiple files
router.post(
  "/upload",
  upload.array("files", 10),
  uploadFiles
);

// Get files for a session
router.get(
  "/session/:session_id",
  getFilesForSession
);

// Delete file (session-guarded)
router.delete(
  "/:session_id/:id",
  deleteSessionFileById
);

export default router;
