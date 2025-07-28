import express from 'express'
import pool from '../configuration/dbconfig.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/databases - Get all databases for a logged-in user
router.get('/databases', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const result = await pool.query(
      'SELECT * FROM user_databases WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Error fetching databases:', err.message)
    res.status(500).json({ error: 'Failed to fetch databases' })
  }
})

// POST /api/databases - Create a new database for the logged-in user
router.post('/databases', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const { db_name } = req.body
  if (!db_name) {
    return res.status(400).json({ error: 'Database name is required' })
  }
  try {
    const result = await pool.query(
      'INSERT INTO user_databases (user_id, db_name, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, db_name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error creating database:', err.message)
    res.status(500).json({ error: 'Failed to create database' })
  }
})

// POST /api/databases/:dbId/tables - Create table and insert data
router.post('/databases/:dbId/tables', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const { dbId } = req.params
  const { tableName, columns, data } = req.body
  if (!tableName || !Array.isArray(columns) || columns.length === 0 || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'Table name, columns, and data are required' })
  }
  const client = await pool.connect()
  try {
    // Step 1: Validate user ownership
    const checkDb = await client.query(
      'SELECT * FROM user_databases WHERE id = $1 AND user_id = $2',
      [dbId, userId]
    )
    if (checkDb.rowCount === 0) {
      return res.status(403).json({ error: 'Unauthorized access to database' })
    }
    // Step 2: Construct CREATE TABLE query
    const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '')
    const tableIdentifier = `"${safeTableName}"`
    const tableColumns = [
      `"id" SERIAL PRIMARY KEY`,
      `"database_id" INTEGER REFERENCES user_databases(id)`,
      ...columns.map(col => `"${col.name}" ${col.type}`)
    ].join(', ')
    const createQuery = `CREATE TABLE ${tableIdentifier} (${tableColumns})`
    await client.query(createQuery)
    // Step 3: Insert data rows
    for (const row of data) {
      const colNames = ['database_id', ...columns.map(col => col.name)]
      const placeholders = colNames.map((_, i) => `$${i + 1}`)
      const values = [dbId, ...columns.map(col => row[col.name])]
      await client.query(
        `INSERT INTO ${tableIdentifier} (${colNames.map(n => `"${n}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
      )
    }
    res.status(201).json({ message: 'Table created and data inserted', tableName: safeTableName })
  } catch (err) {
    console.error('Error creating table:', err.message)
    res.status(500).json({ error: 'Failed to create table' })
  } finally {
    client.release()
  }
})

// GET /api/databases/:dbId/related-tables - Fetch tables related to a db
router.get('/databases/:dbId/related-tables', authenticateToken, async (req, res) => {
  const dbId = parseInt(req.params.dbId, 10)
  if (isNaN(dbId)) {
    return res.status(400).json({ error: 'Invalid database ID' })
  }
  const client = await pool.connect()
  try {
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `)
    const allTables = tablesResult.rows.map(row => row.table_name)
    const relatedTables = []
    for (const tableName of allTables) {
      const hasColumn = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'database_id'
      `, [tableName])

      if (hasColumn.rowCount > 0) {
        const safeName = `"${tableName.replace(/"/g, '""')}"`
        const match = await client.query(
          `SELECT 1 FROM ${safeName} WHERE database_id = $1 LIMIT 1`,
          [dbId]
        )
        if (match.rowCount > 0) {
          relatedTables.push(tableName)
        }
      }
    }
    res.json({ tables: relatedTables })
  } catch (err) {
    console.error('Error fetching related tables:', err)
    res.status(500).json({ error: 'Failed to fetch related tables' })
  } finally {
    client.release()
  }
})

export default router
