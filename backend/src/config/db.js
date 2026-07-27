'use strict';

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('DB query failed:', err.message);
    throw err;
  }
}

async function withTransaction(fn) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function healthCheck() {
  await pool.query('SELECT 1');
}

module.exports = {
  pool,
  query,
  withTransaction,
  healthCheck,
};