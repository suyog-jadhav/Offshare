import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import {
  uploadFiles,
  getFilesForSession,
  deleteSessionFileById
} from "../controllers/file.controller.js";
import { validateActiveSession } from "../middlewares/sessionValidation.middleware.js";

const router = Router();

/* =========================
   UPLOAD FILES
   ========================= */
// session_id comes from body
router.post(
  "/upload",
  upload.array("files", 10),
  validateActiveSession,
  uploadFiles
);

/* =========================
   GET FILES FOR SESSION
   ========================= */
router.get(
  "/session/:session_id",
  validateActiveSession,
  getFilesForSession
);

/* =========================
   DELETE FILE
   ========================= */
router.delete(
  "/session/:session_id/file/:id",
  validateActiveSession,
  deleteSessionFileById
);

export default router;
