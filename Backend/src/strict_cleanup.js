
import db from "./db/connection.js";
import { SESSION_TTL } from "../constants.js"; // Should be 300

console.log(`=== ENFORCING STRICT EXPIRY (TTL: ${SESSION_TTL}s) ===`);

// 1. Recalculate expires_at for ALL active sessions based on last_activity_at
const updateResult = db.prepare(`
    UPDATE sessions 
    SET expires_at = DATETIME(last_activity_at, '+' || ? || ' seconds')
    WHERE is_active = 1
`).run(SESSION_TTL);

console.log(`Updated expiry for ${updateResult.changes} active sessions based on actual activity.`);

// 2. Run Cleanup immediately to kill the old ones
const cleanupResult = db.prepare(`
    UPDATE sessions
    SET is_active = 0,
        ended_at = CURRENT_TIMESTAMP
    WHERE is_active = 1
      AND expires_at <= CURRENT_TIMESTAMP
`).run();

console.log(`🧹 Immediate Cleanup: Expired ${cleanupResult.changes} sessions that were inactive too long.`);
