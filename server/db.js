import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Admin',
  database: process.env.PGDATABASE || 'campushub',
});

// Helper for logging executed SQL queries in terminal
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[SQL] (${duration}ms) ${text.replace(/\s+/g, ' ').trim()}`);
    return res;
  } catch (err) {
    console.error(`[SQL ERROR] ${err.message} -- Query: ${text}`);
    throw err;
  }
}
