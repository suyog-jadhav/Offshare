import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";
import { createSessionInDB, endSessionInDB, updateHeartbeatInDB, getActiveSessionFromDB, cleanupExpiredSessions } from "../db/crud/session.crud.js";
import { upsertDevice } from "../db/crud/device.crud.js";
import { getLocalIP } from "../utils/IPprovider.js";
import { SESSION_TTL, HEARTBEAT_EXTEND } from "../../constants.js";
import db from "../db/connection.js";

export const startSession = asyncHandler(async (req, res) => {
    console.log("👉 startSession called");
    console.log("👉 Body:", req.body);
    const { device_type, device_name, device_id } = req.body;

    if (!device_type || !device_name) {
        console.error("❌ Missing device info:", req.body);
        throw new ApiError(400, "Device information is required");
    }

    // 1. Determine Client IP (Use request IP, not Server IP)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // 2. Check for EXISTING active session to reuse (Deduplication)
    //    Match by: Provided ID OR (Name + Type + IP)
    const existingSession = db.prepare(`
        SELECT s.*, d.id as linked_device_id 
        FROM sessions s
        JOIN devices d ON d.id = s.device_id
        WHERE s.is_active = 1
        AND (
            d.id = @inputDeviceId
            OR (d.device_name = @name AND d.device_type = @type AND d.local_ip = @ip)
        )
    `).get({
        inputDeviceId: device_id || 'NOMATCH', // If null, don't match by ID
        name: device_name,
        type: device_type,
        ip: clientIp // We now store CLIENT IP in DB for this check to work
    });

    if (existingSession) {
        console.log(`🔄 Reusing existing session ${existingSession.id} for ${device_name}`);
        // Return existing session details
        return res.status(200).json(
            new ApiResponse("Session resumed successfully", {
                session_id: existingSession.id,
                device_id: existingSession.linked_device_id,
                expires_in: SESSION_TTL,
                is_resumed: true
            }, 200)
        );
    }

    // 3. Create NEW Session
    const sessionId = uuidv4();
    const deviceId = device_id || uuidv4();

    // Store CLIENT IP in device record
    await upsertDevice({
        id: deviceId,
        device_name,
        device_type,
        local_ip: clientIp
    });

    await createSessionInDB({
        id: sessionId,
        device_id: deviceId
    });

    console.log(`✨ Created NEW session ${sessionId} for ${device_name} (${clientIp})`);

    return res.status(201).json(
        new ApiResponse("Session created successfully", {
            session_id: sessionId,
            device_id: deviceId,
            expires_in: SESSION_TTL
        }, 201)
    );
});

export const endSession = asyncHandler(async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        throw new ApiError(400, "Session ID is required");
    }

    const activeSession = await getActiveSessionFromDB(session_id);

    if (!activeSession) {
        throw new ApiError(404, "Active session not found");
    }

    await endSessionInDB(session_id);

    return res.status(200).json(
        new ApiResponse("Session ended successfully", null, 200)
    )

})

export const heartbeat = asyncHandler(async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        throw new ApiError(400, "Session ID is required");
    }

    const activeSession = await getActiveSessionFromDB(session_id);
    if (!activeSession) {
        throw new ApiError(404, "Active session not found");
    }

    await updateHeartbeatInDB(session_id);

    return res.status(200).json(
        new ApiResponse("Heartbeat updated successfully", {
            expires_in: HEARTBEAT_EXTEND,//seconds
            server_time: Date.now()
        }, 200)
    )
})

export const getAllSessionsController = asyncHandler((req, res) => {
    // Ensure expired sessions are marked inactive before fetching
    cleanupExpiredSessions();

    const { active } = req.query; // 'true' or 'false'
    const params = [];

    // Filter clause for the inner query
    let whereClause = "";
    if (active !== undefined) {
        whereClause = "AND s.is_active = ?";
        params.push(active === 'true' ? 1 : 0);
    }

    const query = `
        WITH SessionDetails AS (
            SELECT
                s.id,
                s.device_id,
                s.started_at,
                s.last_activity_at,
                s.is_active,
                d.device_name,
                d.device_type,
                -- If multiple files/customers, pick the first non-null name, loosely
                COALESCE(MAX(c.name), 'Guest') as customer_name
            FROM sessions s
            JOIN devices d ON d.id = s.device_id
            LEFT JOIN files f ON f.session_id = s.id
            LEFT JOIN customers c ON c.id = f.customer_id
            WHERE 1=1 ${whereClause}
            GROUP BY s.id
        ),
        Ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY last_activity_at DESC) as rn
            FROM SessionDetails
        )
        SELECT * FROM Ranked WHERE rn = 1
        ORDER BY last_activity_at DESC
    `;

    const sessions = db.prepare(query).all(...params);

    return res.status(200).json(
        new ApiResponse("Unique sessions per device fetched", sessions, 200)
    );
});