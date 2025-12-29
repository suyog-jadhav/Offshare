import { Router } from "express";
import {
  createSettings,
  updateSettings,
  getSettings
} from "../controllers/printSettings.controller.js";

import {
  createPrintJobs,
  getJobsBySession
} from "../controllers/printJobs.controller.js";

const router = Router();

/* PRINT SETTINGS */
router.post("/settings", createSettings);
router.put("/settings/:session_id", updateSettings);
router.get("/settings/:session_id", getSettings);

/* PRINT JOBS */
router.post("/jobs/create", createPrintJobs);
router.get("/jobs/session/:session_id", getJobsBySession);
router.put("/jobs/:id/print",printJob);
router.put("/jobs/:id/cancel",cancelPrintJob);
router.put("/jobs/:id/fail",failPrintJob);

export default router;
