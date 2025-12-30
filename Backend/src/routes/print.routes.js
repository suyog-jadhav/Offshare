import { Router } from "express";

/* CONTROLLERS */
import {
  createSettings,
  updateSettings,
  getSettings
} from "../controllers/printSettings.controller.js";

import {
  createPrintJobController,
  getJobsBySessionController,
  printJobController,
  cancelPrintJobController,
  failPrintJobController
} from "../controllers/printJobs.controller.js";

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
  createPrintJobController
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
