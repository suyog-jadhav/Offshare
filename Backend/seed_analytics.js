import db from "./src/db/connection.js";
import { v4 as uuidv4 } from "uuid";

console.log("🌱 Seeding Fake Analytics Data...");

const DEVICES = [
    { name: "OnePlus 9", type: "android" },
    { name: "iPhone 13", type: "ios" },
    { name: "Samsung S21", type: "android" },
    { name: "MacBook Air", type: "laptop" },
    { name: "Redmi Note 10", type: "android" }
];

const FILE_TYPES = ["pdf", "pdf", "pdf", "docx", "jpg", "png"];
const STATUSES = ["PRINTED", "PRINTED", "PRINTED", "PENDING", "FAILED"];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

try {
    // 1. Create Devices
    const deviceIds = [];
    for (const d of DEVICES) {
        const id = uuidv4();
        deviceIds.push(id);
        const existing = db.prepare("SELECT id FROM devices WHERE device_name = ?").get(d.name);
        if (!existing) {
            db.prepare(`
                INSERT INTO devices (id, device_name, device_type, local_ip, last_seen)
                VALUES (?, ?, ?, ?, datetime('now'))
            `).run(id, d.name, d.type, `192.168.1.${Math.floor(Math.random() * 255)}`);
        } else {
            deviceIds.push(existing.id);
        }
    }

    // 2. Generate 30 days of data
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let totalRevenue = 0;
    let totalJobs = 0;

    for (let i = 0; i < 100; i++) {
        const createdAt = randomDate(thirtyDaysAgo, now).toISOString().slice(0, 19).replace('T', ' ');
        const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];

        // Session
        const sessionId = uuidv4();
        db.prepare(`
            INSERT INTO sessions (id, device_id, expires_at, is_active, started_at)
            VALUES (?, ?, datetime(?, '+1 hour'), 0, ?)
        `).run(sessionId, deviceId, createdAt, createdAt);

        // File
        const fileId = uuidv4();
        const fileType = FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
        db.prepare(`
            INSERT INTO files (id, session_id, original_name, stored_name, file_type, local_path, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(fileId, sessionId, `doc_${i}.${fileType}`, `stored_${i}.${fileType}`, fileType, `/tmp/fake`, createdAt);

        // Print Job
        const jobId = uuidv4();
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const cost = (Math.floor(Math.random() * 50) + 10); // 10 to 60 rupees

        // Fake settings
        const settingsId = uuidv4();
        db.prepare(`
            INSERT INTO print_settings (id, color_mode, copies, paper_size, sides, created_at)
            VALUES (?, 'BW', 1, 'A4', 'SINGLE', ?)
        `).run(settingsId, createdAt);

        db.prepare(`
            INSERT INTO print_jobs (id, file_id, settings_id, pages, copies, price_per_page, cost, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(jobId, fileId, settingsId, 5, 1, 2.0, cost, status, createdAt);

        if (status === 'PRINTED') {
            totalRevenue += cost;
        }
        totalJobs++;
    }

    console.log(`✅ Seeded 100 jobs across last 30 days.`);
    console.log(`💰 Est. Revenue added: ₹${totalRevenue}`);

} catch (err) {
    console.error("❌ Seeding Failed:", err);
}
