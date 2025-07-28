import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: "postgres://postgres:Abhiraj%40123@dpg-cooldb12345.pg.render.com:5432/project_pg",
  ssl: false,
});

export default pool;
