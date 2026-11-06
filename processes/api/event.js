// Event API routes. Mount with: app.use("/api/events", require("./routes/events"));
const express = require("express");
const multer = require("multer");
const db = require("../db/connection"); // TODO: export your sqlite3.Database instance from this file

const router = express.Router();

// ---------- Feature switches (flip these when the team is ready) ----------
const REQUIRE_APPROVAL = false; // false: new events are 'approved' immediately. true: they start 'pending'.
const CATEGORIES = ["OSA Activities", "Weekender", "Lectures", "Traditions", "Athletics"];

// ---------- Auth placeholders: pass-through for now ----------
function requireLogin(req, res, next) {
    // TODO: check req.session / JWT. Reject with: return res.status(401).json({ error: "Login required" });
    next();
}

function requireAdmin(req, res, next) {
    // TODO: check the user's role. Reject with: return res.status(403).json({ error: "Admins only" });
    next();
}

// Image is kept in memory and written to the DB as a BLOB (2 MB cap matches the form).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        cb(null, ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.mimetype));
    }
});

// "15:00" -> "3:00 PM" (the calendar cards display this format)
function formatTime(t) {
    let [h, m] = t.split(":").map(Number);
    let suffix = h >= 12 ? "PM" : "AM";
    return ((h % 12) || 12) + ":" + String(m).padStart(2, "0") + " " + suffix;
}

// ---------- POST /api/events: create ----------
router.post("/", requireLogin, upload.single("picture"), function (req, res) {
    let { title, start_date, start_time, category, description, location } = req.body;

    if (!title || !start_date || !start_time || !category || !description || !location) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    let status = REQUIRE_APPROVAL ? "pending" : "approved";
    let picture = req.file ? req.file.buffer : null;
    let pictureMime = req.file ? req.file.mimetype : null;
    let createdBy = req.user ? req.user.id : null; // TODO: set by your login middleware

    // TODO: adjust table/column names to match the final schema
    let sql = `INSERT INTO events
        (title, start_date, start_time, category, description, location, picture, picture_mime, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [title, start_date, start_time, category, description, location,
        picture, pictureMime, status, createdBy], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ id: this.lastID, status: status });
        });
});

// ---------- GET /api/events: list in the shape calendar.js / FullCalendar expects ----------
router.get("/", function (req, res) {
    // Does not select the BLOB itself, only whether one exists.
    let sql = `SELECT id, title, start_date, start_time, category, description, location,
                      (picture IS NOT NULL) AS has_picture
               FROM events WHERE status = 'approved' ORDER BY start_date, start_time`;

    db.all(sql, [], function (err, rows) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows.map(function (r) {
            return {
                id: r.id,
                title: r.title,
                start: r.start_date,
                category: r.category,
                extendedProps: {
                    time: formatTime(r.start_time),
                    description: r.description,
                    location: r.location,
                    picture: r.has_picture ? "/api/events/" + r.id + "/picture" : undefined
                }
            };
        }));
    });
});

// ---------- GET /api/events/:id/picture: serve the BLOB (usable directly as an <img src>) ----------
router.get("/:id/picture", function (req, res) {
    db.get("SELECT picture, picture_mime FROM events WHERE id = ?", [req.params.id], function (err, row) {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row || !row.picture) return res.status(404).end();
        res.type(row.picture_mime).send(row.picture);
    });
});

// ---------- PATCH /api/events/:id/status: future admin approval ----------
router.patch("/:id/status", requireLogin, requireAdmin, function (req, res) {
    let { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    db.run("UPDATE events SET status = ? WHERE id = ?", [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: "Database error" });
        if (this.changes === 0) return res.status(404).json({ error: "Event not found" });
        res.json({ id: Number(req.params.id), status: status });
    });
});

module.exports = router;