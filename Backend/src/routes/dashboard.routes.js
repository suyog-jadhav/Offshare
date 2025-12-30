import { Router } from "express";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

import {
  getActiveSessions,
  getTodayJobs,
  getTodayRevenue
} from "../controllers/dashboard.controller.js";

const router = Router();

/* 🔐 Shop auth for all dashboard routes */
router.use(verifyShopAuth);

/* 📊 Dashboard APIs */
router.get("/sessions/active", getActiveSessions);
router.get("/jobs/today", getTodayJobs);
router.get("/revenue/today", getTodayRevenue);

export default router;
