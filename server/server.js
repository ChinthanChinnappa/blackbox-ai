// Entry point — starts the HTTP server
require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message);
    process.exit(1);
  }
};

start();
