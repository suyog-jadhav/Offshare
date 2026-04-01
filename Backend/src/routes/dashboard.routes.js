import { Router } from "express";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

import {
  getActiveSessions,
  getTodayJobs,
  getTodayRevenue,
  getDashboardStats
} from "../controllers/dashboard.controller.js";

const router = Router();

/* 🔐 Shop auth for all dashboard routes */
router.use(verifyShopAuth);

/* 📊 Dashboard APIs */
router.get("/sessions/active", getActiveSessions);
router.get("/jobs/today", getTodayJobs);
router.get("/recent-activity", getTodayJobs); // Alias for dashboard
router.get("/revenue/today", getTodayRevenue);
router.get("/stats", getDashboardStats); // ✅ Added missing route

export default router;
