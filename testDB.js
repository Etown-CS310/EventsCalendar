const { getDBConnection } = require('./db');

async function testDatabase() {
    let db;

    try {
        db = await getDBConnection();

        let rows = await db.all('SELECT * FROM events;');

        console.log(rows);
    } catch (error) {
        console.log('Database error:', error);
    } finally {
        if (db) {
            await db.close();
        }
    }
}

testDatabase();