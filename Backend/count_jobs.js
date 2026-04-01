import db from './src/db/connection.js';
const jobs = db.prepare("SELECT COUNT(*) as count FROM print_jobs").get();
console.log("Job Count:", jobs.count);
const rows = db.prepare("SELECT * FROM print_jobs ORDER BY created_at DESC LIMIT 5").all();
console.log(rows);
