import { Router } from "express";
import {
  startSession,
  endSession,
  heartbeat
} from "../controllers/session.controller.js";

import { validateActiveSession } from "../middlewares/sessionValidation.middleware.js";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

const router = Router();

/* =========================
   SESSION LIFECYCLE
   ========================= */

// User starts session
router.post("/start", startSession);

// User heartbeat (keep session alive)
router.post(
  "/heartbeat",
  validateActiveSession,
  heartbeat
);

// Shop OR system ends session
router.post(
  "/end",
  verifyShopAuth,       // 🔐 shop-only
  validateActiveSession,
  endSession
);

export default router;
