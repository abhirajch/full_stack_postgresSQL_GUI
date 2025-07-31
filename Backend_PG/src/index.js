import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './configuration/dbconfig.js'
import databaseRoutes from './routes/databaseRoutes.js'
import authRoutes from './routes/auth.js';
import tableRoute from './routes/table.js'
import techDatabase from './routes/techDatabaseRoutes.js'
import techTable from './routes/techTable.js'
import TechTableRoutes from './routes/TechTableRoutes.js'

dotenv.config()

const app = express()
app.use(cors({
  origin: '*', // or specify your frontend URL
  credentials: true
}));
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/auth', databaseRoutes)
app.use('/api/auth', tableRoute)
app.use('/api/auth', techDatabase)
app.use('/api/auth', techTable)
app.use('/api/auth', TechTableRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
