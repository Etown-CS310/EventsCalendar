const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function getDBConnection() {
    const db = await sqlite.open({
        filename: './events.db',
        driver: sqlite3.Database
    });

    return db;
}

// Create the users table for user authentication
async function initializeUsersTable() {
    const db = await getDBConnection();

    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } finally {
        await db.close();
    }
}

module.exports = { getDBConnection, initializeUsersTable };