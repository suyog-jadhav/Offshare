import db from './src/db/connection.js';
console.log("--- FILES ---");
console.table(db.prepare("SELECT id, original_name, session_id FROM files").all());
