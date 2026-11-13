
const { syncEvents } = require("./syncEvents");
const express = require("express");
const { getDBConnection } = require("./db");

const app = express();
const PORT = 3000;

// Parse JSON requests
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// GET all events
app.get("/api/events", async (req, res) => {
    let db;

    try {
        db = await getDBConnection();

        const events = await db.all(
            "SELECT * FROM events ORDER BY start_time"
        );

        res.status(200).json(events);
    } catch (error) {
        console.error("Error retrieving events:", error);

        res.status(500).json({
            error: "Error retrieving events"
        });
    } finally {
        if (db) await db.close();
    }
});

// POST create an event
app.post("/api/events", async (req, res) => {
    let db;

    try {
        const {
            title,
            description,
            start_time,
            end_time,
            location,
            category
        } = req.body || {};

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof start_time !== "string" ||
            !start_time.trim() ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                error: "Title, start time, and category are required"
            });
        }

        const start = new Date(start_time);
        const end = end_time ? new Date(end_time) : null;

        if (
            isNaN(start.getTime()) ||
            (end && isNaN(end.getTime()))
        ) {
            return res.status(400).json({
                error: "Invalid event date or time"
            });
        }

        if (end && end <= start) {
            return res.status(400).json({
                error: "End time must be after start time"
            });
        }

        db = await getDBConnection();

        const result = await db.run(
            `INSERT INTO events
            (title, description, start_time, end_time, location, category)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                description || "",
                start.toISOString(),
                end ? end.toISOString() : null,
                location || "",
                category.trim()
            ]
        );

        return res.status(201).json({
            message: "Event created successfully",
            id: result.lastID
        });

    } catch (error) {
        console.error("Error creating event:", error);

        return res.status(500).json({
            error: "Error creating event"
        });
    } finally {
        if (db) await db.close();
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Initial event sync
syncEvents().catch(error => {
    console.error("Initial event sync failed:", error);
});

// Sync every hour
setInterval(() => {
    console.log("Checking for updated Etown events...");

    syncEvents().catch(error => {
        console.error("Scheduled event sync failed:", error);
    });
}, 60 * 60 * 1000);
