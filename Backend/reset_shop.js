import db from './src/db/connection.js';

try {
    const result = db.prepare('DELETE FROM shop').run();
    console.log(`Deleted ${result.changes} shop(s).`);
} catch (error) {
    console.error('Error deleting shop:', error);
}
