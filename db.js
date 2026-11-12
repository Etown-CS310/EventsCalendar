const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function getDBConnection() {
    const db = await sqlite.open({
        filename: './events.db',
        driver: sqlite3.Database
    });

    return db;
}

module.exports = { getDBConnection };