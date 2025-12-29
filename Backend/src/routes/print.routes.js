import {Router} from "express";

const router = Router();

router.route("/settings/create").post();
router.route("/settings/update/:session_id").put();
router.route("/settings/get/:session_id").get();

router.route("/print/jobs/create").post();


export default router;