import Database from "better-sqlite3";
import path from "path";

// Absolute path is safer
const dbPath = path.resolve("offline_xerox.db");

const db = new Database(dbPath);

// Recommended pragmas for offline apps
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");

export default db;
