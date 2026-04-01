import db from './src/db/connection.js';

const shop = db.prepare('SELECT * FROM shop').get();
console.log('Existing shop:', shop);
