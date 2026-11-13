
const { syncEvents } = require("./syncEvents");
const express = require("express");
const { getDBConnection, initializeUsersTable } = require("./db");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const authRoutes = require("./processes/api/auth");

const app = express();
const PORT = 3000;

// Parse JSON requests
app.use(express.json());

// Configure user sessions
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Authentication API routes
app.use("/api", authRoutes);

// Serve frontend files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Serve frontend JavaScript files
app.use("/processes/calendarJS", express.static(
    path.join(__dirname, "processes", "calendarJS")
));

app.use("/processes/createEventJS", express.static(
    path.join(__dirname, "processes", "createEventJS")
));

app.get("/processes/eventsSearch.js", (req, res) => {
    res.sendFile(path.join(__dirname, "processes", "eventsSearch.js"));
});

app.get("/processes/homepage.js", (req, res) => {
    res.sendFile(path.join(__dirname, "processes", "homepage.js"));
});

// Serve homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Serve HTML pages
app.get("/:page", (req, res, next) => {
    const allowedPages = [
        "index.html",
        "events.html",
        "calendar.html",
        "login.html",
        "register.html",
        "navbar.html",
        "footer.html",
        "eventForm.html"
    ];

    if (!allowedPages.includes(req.params.page)) {
        return next();
    }

    res.sendFile(path.join(__dirname, req.params.page));
});

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
initializeUsersTable()
    .then(() => {
        console.log("Users table initialized");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error("Failed to initialize users table:", error);
        process.exit(1);
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
