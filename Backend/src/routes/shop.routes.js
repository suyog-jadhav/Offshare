import { Router } from "express";
import {
  createShop,
  getShop,
  updateShop
} from "../controllers/shop.controller.js";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

const router = Router();

/* Initial setup – no auth */
router.post("/", createShop);

/* Protected shop operations */
router.use(verifyShopAuth);

router.get("/", getShop);
router.put("/", updateShop);

export default router;
