
const express = require("express");
const bcrypt = require("bcryptjs");
const { getDBConnection } = require("../../db");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    let db;

    try {
        const { email, password } = req.body || {};

        // Validate email and password
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                error: "Please enter a valid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters"
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                error: "Password is too long"
            });
        }

        db = await getDBConnection();

        // Check if the email is already registered
        const existingUser = await db.get(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUser) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 12);

        // Insert the new user into the database
        const result = await db.run(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            [normalizedEmail, passwordHash]
        );

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                id: result.lastID,
                email: normalizedEmail
            }
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            error: "Unable to create account"
        });

    } finally {
        if (db) await db.close();
    }
});

// Log in an existing user
router.post("/login", async (req, res) => {
    let db;

    try {
        const { email, password } = req.body || {};

        // Validate login information
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                error: "Please enter a valid email and password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        db = await getDBConnection();

        // Find the user in the database
        const user = await db.get(
            "SELECT * FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        // Compare the password with the stored password hash
        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        // Create a new session after successful login
        req.session.regenerate(error => {
            if (error) {
                return res.status(500).json({
                    error: "Unable to create login session"
                });
            }

            req.session.user = {
                id: user.id,
                email: user.email
            };

            req.session.save(error => {
                if (error) {
                    return res.status(500).json({
                        error: "Unable to save login session"
                    });
                }

                return res.status(200).json({
                    message: "Login successful",
                    user: req.session.user
                });
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Unable to log in"
        });

    } finally {
        if (db) await db.close();
    }
});

// Check if a user is currently logged in
router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Not logged in"
        });
    }

    return res.status(200).json({
        user: req.session.user
    });
});

// Log out the current user
router.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({
                error: "Unable to log out"
            });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout successful"
        });
    });
});

module.exports = router;
