import { Router } from "express";
import { createNewCustomer,getCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.route("/create").post(createNewCustomer);
router.route("/:id").get(getCustomer);



export default router;