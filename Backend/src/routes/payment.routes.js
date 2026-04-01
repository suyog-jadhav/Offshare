import {Router} from "express";

//later import controller functions
const router = Router();
router.route("/create").post();
//GET /api/payments/job/:print_job_id
router.route("/job/:print_job_id").get();

export default router;