import db from "./src/db/connection.js";

console.log("🔍 Debugging Database Content...");

try {
    const sessionCount = db.prepare("SELECT COUNT(*) as count FROM sessions").get();
    const activeSessionCount = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE is_active = 1").get();
    const jobCount = db.prepare("SELECT COUNT(*) as count FROM print_jobs").get();
    const customerCount = db.prepare("SELECT COUNT(*) as count FROM customers").get();
    const fileCount = db.prepare("SELECT COUNT(*) as count FROM files").get();

    console.log("--------------------------------");
    console.log(`Sessions Total: ${sessionCount.count}`);
    console.log(`Sessions Active: ${activeSessionCount.count}`);
    console.log(`Print Jobs: ${jobCount.count}`);
    console.log(`Customers: ${customerCount.count}`);
    console.log(`Files: ${fileCount.count}`);
    console.log("--------------------------------");

    if (jobCount.count > 0) {
        const jobs = db.prepare("SELECT * FROM print_jobs LIMIT 3").all();
        console.log("Sample Jobs:", jobs);
    }

} catch (err) {
    console.error("❌ DB Read Error:", err);
}
