import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user : "postgres",
  password : "Abhiraj@123",
  port: 5432,
  database: "Project_Pg",
  host: "localhost",
  ssl: false // 🔴 This disables SSL
});

export default pool;