import { Router } from "express";
import { createNewCustomer, getCustomer, getAllCustomersController } from "../controllers/customer.controller.js";

const router = Router();


router.route("/create").post(createNewCustomer);
router.route("/:id").get(getCustomer);

router.get("/", getAllCustomersController);



export default router;