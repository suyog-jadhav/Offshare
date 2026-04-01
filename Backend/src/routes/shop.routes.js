import { Router } from "express";
import {
  createShop,
  getShop,
  updateShop,
  deleteShop
} from "../controllers/shop.controller.js";
import { verifyShopAuth } from "../middlewares/shopAuth.middleware.js";

const router = Router();

/* Initial setup – no auth */
router.post("/", createShop);
router.get("/", getShop);

/* Protected shop operations */
router.use(verifyShopAuth);

router.put("/", updateShop);
router.delete("/", deleteShop);

export default router;
