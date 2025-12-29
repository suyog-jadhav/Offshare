import { Router } from "express";


const router = Router();

// GET /api/dashboard/sessions/active
// GET /api/dashboard/jobs/today
// GET /api/dashboard/revenue/today
router.route("/sessions/active").get();
router.route("/jobs/today").get();
router.route("/revenue/today").get();




export default router;