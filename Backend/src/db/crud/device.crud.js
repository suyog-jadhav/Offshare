import db from "../db/connection.js";

export const upsertDevice = (device) => {
    db.prepare(`
        INSERT INTO devices (id, device_name, device_type, local_ip)
        VALUES (@id, @device_name, @device_type, @local_ip)
        ON CONFLICT(id) DO UPDATE SET
            last_seen = CURRENT_TIMESTAMP,
            local_ip = excluded.local_ip
    `).run(device);
};

export const getDeviceById = (id) => {
    return db.prepare(`SELECT * FROM devices WHERE id = ?`).get(id);
};
