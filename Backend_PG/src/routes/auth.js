import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../configuration/dbconfig.js'

const router = express.Router()
const JWT_SECRET = 'your_super_secret_key' // Ideally store this in an .env file

// REGISTER
router.post('/register', async (req, res) => {
  const {fullname, email, password, type } = req.body
  if (!email || !password || !type) {
    return res.status(400).json({ error: 'Email, password, and type are required' })
  }
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password, type, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, type, fullname]
    )
    const user = result.rows[0]
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, type: user.type, full_name : user.full_name }
    })
  } catch (err) {
    res.status(500).json({ error: 'Database error: ' + err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'User not found' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      JWT_SECRET,
      { expiresIn: '12h' }
    )
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, type: user.type }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message })
  }
})

export default router
