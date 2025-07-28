import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // safer to use env variable
  ssl: {
    rejectUnauthorized: false, // ✅ allows self-signed certs from Render
  },
});

export default pool;
