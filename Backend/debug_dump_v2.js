import db from "./src/db/connection.js";

function dumpTable(tableName) {
    try {
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        console.log(`\n=== TABLE: ${tableName} (${rows.length} rows) ===`);
        if (rows.length > 0) {
            console.table(rows);
        } else {
            console.log("(Empty)");
        }
    } catch (e) {
        console.error(`Error reading ${tableName}:`, e.message);
    }
}

console.log("🔍 Dumping Database Content...");
dumpTable('shop');
dumpTable('devices');
dumpTable('customers');
dumpTable('print_jobs');
