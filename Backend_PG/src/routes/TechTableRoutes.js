import express from 'express';
import pool from '../configuration/dbconfig.js';
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router();

// GET: All rows except the first row
router.get('/:dbName/:tableName/rows', authenticateToken, async (req, res) => {
  const { tableName } = req.params;
  const { dbname } = req.query;
  if (!dbname) {
    return res.status(400).json({ error: 'Missing dbname in query params' });
  }
  try {
    const client = await pool.connect();
    const query = `SELECT * FROM "${tableName}" WHERE dbname = $1`;
    const result = await client.query(query, [dbname]);
    const rowsWithoutDbname = result.rows.map(({ dbname, ...rest }) => rest); 
    res.json(rowsWithoutDbname);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// POST: Insert new record into table
router.post('/execute-sql', authenticateToken, async (req, res) => {
  const { sql, dbname } = req.body;
  if (!sql || !dbname) {
    return res.status(400).json({ error: 'Missing SQL or database name' });
  }
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    res.status(200).json({
      message: 'Query executed successfully',
      rowCount: result.rowCount || 0,
    });
  } catch (err) {
    console.error('SQL execution error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT: Update record by ID
router.put('/:dbName/:tableName/rows/update/:id',authenticateToken, async (req, res) => {
  const { dbName, tableName, id } = req.params;
  const data = req.body;
  try {
    const client = await pool.connect();
    await client.query(`SET search_path TO ${dbName}`);
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await client.query(sql, [...values, id]);
    res.json(result.rows[0]);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE: Delete record by ID
router.delete('/:dbName/:tableName/rows/delete/:id',authenticateToken, async (req, res) => {
  const { dbName, tableName, id } = req.params;
  try {
    const client = await pool.connect();
    await client.query(`SET search_path TO ${dbName}`);
    const result = await client.query(`DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`, [id]);
    res.json({ message: 'Deleted successfully', deleted: result.rows[0] });
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
