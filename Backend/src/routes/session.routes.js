import {Router} from 'express';
import { startSession, endSession, heartbeat } from '../controllers/session.controller.js';

const router = Router();

router.route("/start").post(startSession);
router.route("/end").post(endSession);
router.route("/heartbeat").post(heartbeat);

export default router;