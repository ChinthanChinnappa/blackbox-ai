// User model — DB queries for user management
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query('SELECT id, username, email, role, is_active, last_login, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ username, email, password, role = 'investigator' }) {
    // EDGE CASE: salt rounds hardcoded — should be env configurable
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hash, role]
    );
    return result.rows[0];
  },

  async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  },

  async getAll() {
    const result = await pool.query('SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async deactivate(id) {
    const result = await pool.query('UPDATE users SET is_active = false WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },
};

module.exports = User;
