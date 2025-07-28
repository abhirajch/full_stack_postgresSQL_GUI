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

export default router