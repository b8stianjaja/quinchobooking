// backend/src/models/adminModel.js

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db'); 

const ensureDefaultAdmin = async () => {
    // This code reads the credentials from the environment variables you set on Render.
    // The '||' part is a fallback for local development and won't be used on Render
    // as long as the variables are set there.
    const defaultUsername = process.env.DEFAULT_ADMIN_USER || 'pugagrandon';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'booking25';

    try {
        const res = await pool.query('SELECT * FROM admins WHERE username = $1', [defaultUsername]);
        if (res.rows.length === 0) {
            console.log('Default admin not found, creating one...');
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            await pool.query(
                'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
                [defaultUsername, hashedPassword]
            );
            console.log('Default admin created.');
        }
    } catch (error) {
        console.error('Error ensuring default admin exists:', error);
    }
};

const verifyAdmin = async (username, password) => {
    try {
        const res = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (res.rows.length > 0) {
            const admin = res.rows[0];
            const isMatch = await bcrypt.compare(password, admin.password_hash);
            return isMatch ? admin : null;
        }
        return null;
    } catch (error) {
        console.error('Error verifying admin:', error);
        throw error;
    }
};

module.exports = { ensureDefaultAdmin, verifyAdmin };