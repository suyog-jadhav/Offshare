import { Router } from "express";
import {
  healthCheck,
  cleanupSessions,
  getActiveSessions,
  getAuditLogs,
  getStorageInfo,
  forceEndSession
} from "../controllers/system.controller.js";

const router = Router();

router.get("/health", healthCheck);
router.post("/cleanup", cleanupSessions);
router.get("/sessions/active", getActiveSessions);
router.get("/logs", getAuditLogs);
router.get("/storage", getStorageInfo);
router.post("/session/force-end", forceEndSession);

export default router;
