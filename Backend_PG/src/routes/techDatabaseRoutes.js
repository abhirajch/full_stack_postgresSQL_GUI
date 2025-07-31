import express from 'express'
import pool from '../configuration/dbconfig.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all databases created by the authenticated user
router.get('/sql/databases', authenticateToken, async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      'SELECT datname FROM user_databases_tech WHERE user_id = $1',
      [userId]
    )
    res.json({ rows: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user databases' })
  }
})
// Execute query (create database and store metadata)
router.post('/sql/execute', authenticateToken, async (req, res) => {
  const { query } = req.body
  const userId = req.user.id
  const dbNameMatch = query.match(/CREATE DATABASE\s+(\w+)/i)
  if (!dbNameMatch) {
    return res.status(400).json({ error: 'Only CREATE DATABASE queries are allowed' })
  }
  const dbName = dbNameMatch[1]
  try {
    await pool.query(query) // Create DB
    await pool.query(
      'INSERT INTO user_databases_tech (user_id, datname) VALUES ($1, $2)',
      [userId, dbName]
    )
    res.json({ message: 'Database created and linked to user' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error executing query' })
  }
})
// Delete database entry and related table
router.delete('/sql/databases/:datname', authenticateToken, async (req, res) => {
  const userId = req.user.id
  const { datname } = req.params

  try {
    // Get database_id (or related table name if stored)
    const result = await pool.query(
      'SELECT id FROM user_databases_tech WHERE user_id = $1 AND datname = $2',
      [userId, datname]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Database not found' })
    }

    const dbId = result.rows[0].id
    // const tableName = `data_${dbId}` // Assuming your table is named like this

    // // Delete the table
    // await pool.query(`DROP TABLE IF EXISTS ${tableName}`)

    // Delete the metadata entry
    await pool.query(
      'DELETE FROM user_databases_tech WHERE id = $1',
      [dbId]
    )

    res.json({ message: 'Database and table deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error deleting database' })
  }
})

export default router