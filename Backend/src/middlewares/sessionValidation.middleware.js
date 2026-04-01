import db from "../db/connection.js";
import { ApiError } from "../utils/ApiError.js";

export const validateActiveSession = (req, res, next) => {
    const sessionId =
        req.params.session_id ||
        req.body.session_id ||
        req.query.session_id;

    if (!sessionId) {
        throw new ApiError(400, "session_id is required");
    }

    const session = db.prepare(`
    SELECT id, is_active
    FROM sessions
    WHERE id = ?
    `).get(sessionId);
    
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.is_active !== 1) {
        throw new ApiError(409, "Session is not active");
    }

    
    // attach to request for later use
    req.session = session;

    next();
};
