// backend/db.js
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

// PGURI ex: postgres://postgres:PW@database:5432/appdb
export const pool = new Pool({
  connectionString: process.env.PGURI,
});

export async function assertDbConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
  } finally {
    client.release();
  }
}
