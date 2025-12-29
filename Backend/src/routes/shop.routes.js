import {Router} from "express";
import { createShop, getShop, updateShop } from "../controllers/shop.controller.js";


const router = Router();

router
    .route("/")
    .post(createShop)
    .get(getShop)
    .put(updateShop)


export default router;