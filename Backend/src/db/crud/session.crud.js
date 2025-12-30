import db from "../connection.js";
import {SESSION_TTL,HEARTBEAT_EXTEND} from "../../../constants.js";

/*
  SESSION CRUD (FINAL)
  -------------------
  - Offline safe
  - Heartbeat-based
  - Auto-expiry supported
  - Manual end supported
*/

/**
 * Create a new session
 * TTL: 30 seconds
 */
export const createSessionInDB = ({ id, device_id }) => {
  return db.prepare(`
    INSERT INTO sessions (
      id,
      device_id,
      is_active,
      started_at,
      last_activity_at,
      expires_at
    )
    VALUES (
      @id,
      @device_id,
      1,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      DATETIME('now', '+${SESSION_TTL} seconds')
    )
  `).run({ id, device_id });
};

/**
 * Get active session (used by heartbeat & guards)
 */
export const getActiveSessionFromDB = (session_id) => {
  return db.prepare(`
    SELECT *
    FROM sessions
    WHERE id = ?
      AND is_active = 1
      AND expires_at > CURRENT_TIMESTAMP
  `).get(session_id);
};

/**
 * Heartbeat update
 * - Refresh last activity
 * - Extend expiry
 */
export const updateHeartbeatInDB = (session_id) => {
  return db.prepare(`
    UPDATE sessions
    SET
      last_activity_at = CURRENT_TIMESTAMP,
      expires_at = DATETIME('now', '+${HEARTBEAT_EXTEND} seconds')
    WHERE id = ?
      AND is_active = 1
  `).run(session_id);
};

/**
 * End session manually
 */
export const endSessionInDB = (session_id) => {
  return db.prepare(`
    UPDATE sessions
    SET
      is_active = 0,
      ended_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND is_active = 1
  `).run(session_id);
};

/**
 * Cleanup expired sessions (call via cron / interval)
 */
export const cleanupExpiredSessions = () => {
  return db.prepare(`
    UPDATE sessions
    SET
      is_active = 0,
      ended_at = CURRENT_TIMESTAMP
    WHERE is_active = 1
      AND expires_at <= CURRENT_TIMESTAMP
  `).run();
};
