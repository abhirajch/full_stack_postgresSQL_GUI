import jwt from 'jsonwebtoken'

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    console.warn('No Authorization header')
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    console.warn('Token is empty after split')
    return res.status(401).json({ error: 'Token is missing' })
  }

  try {
    const decoded = jwt.verify(token, 'your_super_secret_key')
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}

export default authenticateToken
