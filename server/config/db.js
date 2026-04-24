// Database connection configuration using pg Pool
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'black_ai_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  // EDGE CASE: max connections not capped — can exhaust DB under heavy load
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});

module.exports = pool;
