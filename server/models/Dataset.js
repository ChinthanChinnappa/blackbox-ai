// Dataset model
const pool = require('../config/db');

const Dataset = {
  async getAll(userId) {
    const query = userId
      ? 'SELECT * FROM datasets WHERE uploaded_by = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM datasets ORDER BY created_at DESC';
    const result = await pool.query(query, userId ? [userId] : []);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM datasets WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ name, file_type, file_size, uploaded_by }) {
    const result = await pool.query(
      'INSERT INTO datasets (name, file_type, file_size, uploaded_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, file_type, file_size, uploaded_by]
    );
    return result.rows[0];
  },

  async updateScanResult(id, { risk_score, findings, scan_status }) {
    const result = await pool.query(
      'UPDATE datasets SET risk_score=$1, findings=$2, scan_status=$3 WHERE id=$4 RETURNING *',
      [risk_score, JSON.stringify(findings), scan_status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM datasets WHERE id = $1', [id]);
  },
};

module.exports = Dataset;
