import { Router } from "express";

/* PRINT SETTINGS CONTROLLERS */
import {
  createSettings,
  updateSettings,
  getSettings
} from "../controllers/printSettings.controller.js";

/* PRINT JOB CONTROLLERS */
import {
  createPrintJobController,
  getJobsBySessionController,
  printJobController,
  cancelPrintJobController,
  failPrintJobController
} from "../controllers/printJobs.controller.js";

const router = Router();

/* =========================
   PRINT SETTINGS
   ========================= */
router.post("/settings", createSettings);
router.put("/settings/:session_id", updateSettings);
router.get("/settings/:session_id", getSettings);

/* =========================
   PRINT JOBS
   ========================= */
router.post("/jobs/create", createPrintJobController);
router.get("/jobs/session/:session_id", getJobsBySessionController);

router.put("/jobs/:id/print", printJobController);
router.put("/jobs/:id/cancel", cancelPrintJobController);
router.put("/jobs/:id/fail", failPrintJobController);

export default router;
