import { Router } from "express";
import {
  createPricing,
  getAllPricing,
  updatePricing,
  deletePricing,
  lookupPricing
} from "../controllers/pricing.controller.js";

const router = Router();

router.post("/", createPricing);
router.get("/", getAllPricing);
router.put("/:id", updatePricing);
router.delete("/:id", deletePricing);
router.get("/lookup", lookupPricing);

export default router;
