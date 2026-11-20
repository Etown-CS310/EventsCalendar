const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

// Role IDs are fixed so the rest of the code can rely on them.
const ROLES = {
    USER: 1,
    ADMIN: 2
};

async function getDBConnection() {
    const db = await sqlite.open({
        filename: './events.db',
        driver: sqlite3.Database
    });

    // SQLite does not enforce foreign keys unless this is turned on
    // for every connection.
    await db.exec('PRAGMA foreign_keys = ON');

    return db;
}

// Adds a column only if it does not already exist, so this is safe to
// run on every server start (and on an existing events.db).
async function addColumnIfMissing(db, table, column, definition) {
    const columns = await db.all(`PRAGMA table_info(${table})`);

    if (!columns.some(col => col.name === column)) {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`Added column ${table}.${column}`);
    }
}

async function tableExists(db, table) {
    const row = await db.get(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        [table]
    );

    return !!row;
}

// Roles lookup table
async function initializeRolesTable(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            role_id INTEGER PRIMARY KEY,
            role_name TEXT NOT NULL UNIQUE
        )
    `);

    // Fixed IDs; INSERT OR IGNORE keeps this safe to re-run
    await db.run(
        'INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (?, ?)',
        [ROLES.USER, 'user']
    );
    await db.run(
        'INSERT OR IGNORE INTO roles (role_id, role_name) VALUES (?, ?)',
        [ROLES.ADMIN, 'admin']
    );
}

// Users table (now with name and role)
async function initializeUsersTable() {
    const db = await getDBConnection();

    try {
        await initializeRolesTable(db);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role_id INTEGER NOT NULL DEFAULT ${ROLES.USER}
                    REFERENCES roles(role_id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migrate an existing users table created before roles existed.
        // Existing users automatically become regular "user" accounts.
        await addColumnIfMissing(db, 'users', 'name', 'TEXT');
        await addColumnIfMissing(
            db,
            'users',
            'role_id',
            `INTEGER NOT NULL DEFAULT ${ROLES.USER} REFERENCES roles(role_id)`
        );

        await initializeEventApprovalColumns(db);
    } finally {
        await db.close();
    }
}

// Adds approval tracking to the events table.
// DEFAULT 'approved' means every existing row and every row inserted by
// syncEvents.js / syncAcademic.js stays visible. Only user submissions
// will explicitly set 'pending' (done in the next step).
async function initializeEventApprovalColumns(db) {
    if (!(await tableExists(db, 'events'))) {
        console.warn('events table not found yet; skipping approval columns');
        return;
    }

    await addColumnIfMissing(
        db, 'events', 'status', "TEXT NOT NULL DEFAULT 'approved'"
    );
    await addColumnIfMissing(
        db, 'events', 'created_by', 'INTEGER REFERENCES users(id)'
    );
    await addColumnIfMissing(
        db, 'events', 'reviewed_by', 'INTEGER REFERENCES users(id)'
    );
    await addColumnIfMissing(db, 'events', 'reviewed_at', 'TEXT');
}

module.exports = {
    ROLES,
    getDBConnection,
    initializeUsersTable
};