import db from './src/db/connection.js';

console.log("--- DEVICES ---");
console.table(db.prepare("SELECT * FROM devices").all());

console.log("\n--- SESSIONS ---");
console.table(db.prepare("SELECT * FROM sessions").all());

console.log("\n--- FILES ---");
console.table(db.prepare("SELECT * FROM files").all());

console.log("\n--- PRINT JOBS ---");
console.table(db.prepare("SELECT * FROM print_jobs").all());
