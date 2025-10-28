// backend/app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { assertDbConnection } from './db.js'

import authRoutes from './routes/authRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())

// enkel CORS för dev
const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // tillåt lokal frontend + no-origin (t.ex. Postman)
    if (!origin || allowed.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))

// routes
app.use('/api/auth', authRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// healthcheck
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
  try {
    await assertDbConnection()
    console.log('✅ MySQL connected')
  } catch (e) {
    console.error('❌ DB connection failed:', e.message)
  }
})
