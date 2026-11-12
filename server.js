const express = require('express');
const { getDBConnection } = require('./db');

const app = express();
const PORT = 3000;
app.use(express.static(__dirname));

app.get('/api/events', async (req, res) => {
    let db;

    try {
        db = await getDBConnection();

        let events = await db.all(
            'SELECT * FROM events ORDER BY start_time'
        );

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving events');
    } finally {
        if (db) {
            await db.close();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});