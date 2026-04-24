// Activity tracking controller
const pool = require('../config/db');

// GET /api/activity/sessions
const getSessions = async (req, res, next) => {
  try {
    const { flagged } = req.query;
    let query = `
      SELECT s.*, u.username, u.email
      FROM activity_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (flagged === 'true') { query += ' AND s.is_flagged = true'; }
    query += ' ORDER BY s.last_active DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/activity/sessions — create or update session
const trackSession = async (req, res, next) => {
  try {
    const { session_token, user_id } = req.body;
    const ip_address = req.ip || req.headers['x-forwarded-for'];
    const user_agent = req.headers['user-agent'];

    if (!session_token) return res.status(400).json({ error: 'session_token is required.' });

    // Upsert session
    const result = await pool.query(
      `INSERT INTO activity_sessions (session_token, user_id, ip_address, user_agent, request_count)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (session_token) DO UPDATE
       SET request_count = activity_sessions.request_count + 1,
           last_active = NOW()
       RETURNING *`,
      [session_token, user_id || null, ip_address, user_agent]
    );

    const session = result.rows[0];

    // Flag if request count exceeds threshold
    // EDGE CASE: threshold hardcoded — should be configurable
    if (session.request_count > 100 && !session.is_flagged) {
      await pool.query(
        `UPDATE activity_sessions SET is_flagged = true,
         anomaly_flags = anomaly_flags || $1::jsonb WHERE session_token = $2`,
        [JSON.stringify(['high_request_volume']), session_token]
      );
      session.is_flagged = true;
    }

    res.json(session);
  } catch (err) { next(err); }
};

// GET /api/activity/stats
const getStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE is_flagged = true) as flagged_sessions,
        SUM(request_count) as total_requests,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM activity_sessions
    `);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/activity/sessions/:id/flag
const flagSession = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await pool.query(
      `UPDATE activity_sessions SET is_flagged = true,
       anomaly_flags = anomaly_flags || $1::jsonb WHERE id = $2 RETURNING *`,
      [JSON.stringify([reason || 'manual_flag']), req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Session not found.' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getSessions, trackSession, getStats, flagSession };
