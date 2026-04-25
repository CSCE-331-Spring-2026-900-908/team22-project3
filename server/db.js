const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PSQL_HOST,
  user: process.env.PSQL_USER,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT || 5432,
  ssl: { rejectUnauthorized: false },
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('Connected to AWS PostgreSQL database.'))
  .catch(err => console.error('Database connection failed:', err.message));

module.exports = pool;
