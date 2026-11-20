// Usage: node seedAdmin.js admin@etown.edu "SomePassword123"
// Creates the account if it doesn't exist, or promotes it to admin if it does.

const bcrypt = require('bcryptjs');
const { getDBConnection, initializeUsersTable, ROLES } = require('./db');

async function seedAdmin() {
    const [email, password] = process.argv.slice(2);

    if (!email || !password) {
        console.error('Usage: node seedAdmin.js <email> <password>');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Password must be at least 8 characters.');
        process.exit(1);
    }

    // Make sure the tables and roles exist first
    await initializeUsersTable();

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDBConnection();

    try {
        const existing = await db.get(
            'SELECT id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existing) {
            await db.run(
                'UPDATE users SET role_id = ? WHERE id = ?',
                [ROLES.ADMIN, existing.id]
            );
            console.log(`Promoted existing user ${normalizedEmail} to admin.`);
        } else {
            const hash = await bcrypt.hash(password, 12);

            await db.run(
                `INSERT INTO users (name, email, password_hash, role_id)
                 VALUES (?, ?, ?, ?)`,
                ['Admin', normalizedEmail, hash, ROLES.ADMIN]
            );
            console.log(`Created admin account ${normalizedEmail}.`);
        }
    } finally {
        await db.close();
    }
}

seedAdmin().catch(error => {
    console.error('Failed to seed admin:', error);
    process.exit(1);
});