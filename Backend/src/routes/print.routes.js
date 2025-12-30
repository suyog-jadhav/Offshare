import { Router } from "express";

/* CONTROLLERS */
import {
  createSettings,
  updateSettings,
  getSettings
} from "../controllers/settings.controller.js";

import {
  createPrintJobsController,
  getJobsBySessionController,
  printJobController,
  cancelPrintJobController,
  failPrintJobController
} from "../controllers/jobs.controller.js";

/* MIDDLEWARES */
import { validateActiveSession } from "../middlewares/sessionValidation.middleware.js";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

const router = Router();

/* =========================
   PRINT SETTINGS (USER)
   ========================= */
router.post(
  "/settings",
  validateActiveSession,
  createSettings
);

router.put(
  "/settings/:session_id",
  validateActiveSession,
  updateSettings
);

router.get(
  "/settings/:session_id",
  validateActiveSession,
  getSettings
);

/* =========================
   PRINT JOBS (SHOP)
   ========================= */
router.post(
  "/jobs/create",
  verifyShopAuth,
  validateActiveSession,
  createPrintJobsController
);

router.get(
  "/jobs/session/:session_id",
  verifyShopAuth,
  validateActiveSession,
  getJobsBySessionController
);

router.put(
  "/jobs/:id/print",
  verifyShopAuth,
  printJobController
);

router.put(
  "/jobs/:id/cancel",
  verifyShopAuth,
  cancelPrintJobController
);

router.put(
  "/jobs/:id/fail",
  verifyShopAuth,
  failPrintJobController
);

export default router;
