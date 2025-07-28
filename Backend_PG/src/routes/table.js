import express from 'express'
import pool from '../configuration/dbconfig.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

// GET rows
router.get('/databases/:dbId/tables/:tableName/rows', authenticateToken, async (req, res) => {
  const { dbId, tableName } = req.params
  const client = await pool.connect()
  try {
    const safeTable = `"${tableName.replace(/"/g, '""')}"`
    const result = await client.query(`SELECT * FROM ${safeTable} WHERE database_id = $1`, [dbId])
    res.json({ rows: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch rows' })
  } finally {
    client.release()
  }
})

// CREATE row
router.post('/databases/:dbId/tables/:tableName/rows', authenticateToken, async (req, res) => {
  const { dbId, tableName } = req.params
  const client = await pool.connect()
  const data = req.body
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)
    keys.push('database_id')
    values.push(dbId)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const columns = keys.map((k) => `"${k}"`).join(', ')
    const safeTable = `"${tableName.replace(/"/g, '""')}"`
    const query = `INSERT INTO ${safeTable} (${columns}) VALUES (${placeholders}) RETURNING *`
    const result = await client.query(query, values)
    res.status(201).json({ row: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create row' })
  } finally {
    client.release()
  }
})

// UPDATE row
router.put('/databases/:dbId/tables/:tableName/rows/:id', authenticateToken, async (req, res) => {
  const { dbId, tableName, id } = req.params
  const updates = req.body
  const client = await pool.connect()
  try {
    const keys = Object.keys(updates)
    const values = Object.values(updates)
    const setClause = keys.map((key, idx) => `"${key}" = $${idx + 1}`).join(', ')
    const safeTable = `"${tableName.replace(/"/g, '""')}"`
    const result = await client.query(
      `UPDATE ${safeTable} SET ${setClause} WHERE id = $${keys.length + 1} AND database_id = $${keys.length + 2} RETURNING *`,
      [...values, id, dbId]
    )
    res.json({ row: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update row' })
  } finally {
    client.release()
  }
})
// DELETE row
router.delete('/databases/:dbId/tables/:tableName/rows/:id', authenticateToken, async (req, res) => {
  const { dbId, tableName, id } = req.params
  const client = await pool.connect()
  try {
    const safeTable = `"${tableName.replace(/"/g, '""')}"`
    await client.query(`DELETE FROM ${safeTable} WHERE id = $1 AND database_id = $2`, [id, dbId])
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete row' })
  } finally {
    client.release()
  }
})

export default router
