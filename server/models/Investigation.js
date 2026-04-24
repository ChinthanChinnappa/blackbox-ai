// Investigation model
const pool = require('../config/db');

const Investigation = {
  async getAll({ status, risk_level } = {}) {
    let query = `
      SELECT i.*, u.username as assigned_username
      FROM investigations i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND i.status = $${params.length}`; }
    if (risk_level) { params.push(risk_level); query += ` AND i.risk_level = $${params.length}`; }
    query += ' ORDER BY i.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT i.*, u.username as assigned_username FROM investigations i
       LEFT JOIN users u ON i.assigned_to = u.id WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ title, description, risk_level = 'low', assigned_to, created_by }) {
    const result = await pool.query(
      'INSERT INTO investigations (title, description, risk_level, assigned_to, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, description, risk_level, assigned_to, created_by]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    // EDGE CASE: no validation on which fields are allowed — any column can be updated
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(id);
    const result = await pool.query(
      `UPDATE investigations SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM investigations WHERE id = $1', [id]);
  },

  async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
        COUNT(*) as total
      FROM investigations
    `);
    return result.rows[0];
  },
};

module.exports = Investigation;
