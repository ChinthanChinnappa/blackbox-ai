// Log model — AI prompt/response logs
const pool = require('../config/db');

const Log = {
  async getByInvestigation(investigationId, { tag, limit = 50, offset = 0 } = {}) {
    let query = "SELECT * FROM logs WHERE investigation_id = '" + investigationId + "'";
    if (tag) {
      query += " AND tag = '" + tag + "'";
    }
    query += ' ORDER BY created_at DESC LIMIT ' + limit + ' OFFSET ' + offset;
    const result = await pool.query(query);
    return result.rows;
  },

  async create({ investigation_id, prompt, response, source_ip, user_agent, session_id, anomaly_score, flagged_patterns, tag }) {
    const result = await pool.query(
      `INSERT INTO logs (investigation_id, prompt, response, source_ip, user_agent, session_id, anomaly_score, flagged_patterns, tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [investigation_id, prompt, response, source_ip, user_agent, session_id,
       anomaly_score, JSON.stringify(flagged_patterns || []), tag]
    );
    return result.rows[0];
  },

  async updateTag(id, tag) {
    const result = await pool.query(
      'UPDATE logs SET tag = $1 WHERE id = $2 RETURNING *',
      [tag, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM logs WHERE id = $1', [id]);
  },

  async getFlaggedStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE tag = 'critical') as critical,
        COUNT(*) FILTER (WHERE tag = 'suspicious') as suspicious,
        COUNT(*) FILTER (WHERE tag = 'safe') as safe,
        COUNT(*) FILTER (WHERE tag IS NULL) as unreviewed,
        ROUND(AVG(anomaly_score)::numeric, 2) as avg_anomaly_score
      FROM logs
    `);
    return result.rows[0];
  },

  async getRecent(limit = 10) {
    const result = await pool.query(
      `SELECT l.*, i.title as investigation_title FROM logs l
       LEFT JOIN investigations i ON l.investigation_id = i.id
       ORDER BY l.created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

module.exports = Log;
