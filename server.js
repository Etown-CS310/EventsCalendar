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
app.use(express.json());

app.post('/api/events', async (req, res) => {
    let db;

    try {
        const {
            title,
            description,
            start_time,
            end_time,
            location,
            category
        } = req.body;

        if (
            typeof title !== 'string' || !title.trim() ||
            typeof start_time !== 'string' || !start_time ||
            typeof category !== 'string' || !category.trim()
        ) {
            return res.status(400).json({
                error: 'Title, start time, and category are required'
            });
        }

        if (end_time && end_time < start_time) {
            return res.status(400).json({
                error: 'End time cannot be before start time'
            });
        }

        db = await getDBConnection();

        const result = await db.run(
            `INSERT INTO events
            (title, description, start_time, end_time, location, category)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                description || '',
                start_time,
                end_time || null,
                location || '',
                category
            ]
        );

        res.status(201).json({
            message: 'Event created successfully',
            id: result.lastID
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error creating event'
        });
    } finally {
        if (db) {
            await db.close();
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});