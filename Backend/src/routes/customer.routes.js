import { Router } from "express";


const router = Router();

router.route("/create").post();
router.route("/:id").get();



export default router;