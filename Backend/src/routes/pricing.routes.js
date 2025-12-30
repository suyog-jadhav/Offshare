import { Router } from "express";
import {
    createPricing,
    getAllPricingController,
    updatePricing,
    deletePricing,
    lookupPricing
} from "../controllers/pricing.controller.js";

const router = Router();

/**
 * Lookup must come FIRST
 */
router.get("/lookup", lookupPricing);

/**
 * Admin routes
 */
router.post("/", createPricing);
router.get("/", getAllPricingController);
router.put("/:id", updatePricing);
router.delete("/:id", deletePricing);

export default router;
