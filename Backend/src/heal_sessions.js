
import db from "./db/connection.js";

console.log("=== HEALING SESSIONS ===");

// Extend all currently active sessions by 1 hour from NOW
const result = db.prepare(`
    UPDATE sessions 
    SET expires_at = DATETIME('now', '+1 hour') 
    WHERE is_active = 1
`).run();

console.log(`Extended expiry for ${result.changes} active sessions.`);
