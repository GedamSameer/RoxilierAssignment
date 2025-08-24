import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import { sequelize } from './models/index.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import storeRoutes from './routes/stores.js'
import ownerRoutes from './routes/owner.js'

const app = express()

const PORT = process.env.PORT || 8080
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'ratings-app', version: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', storeRoutes)      // /stores endpoints for users
app.use('/api/owner', ownerRoutes)

// Initialize DB and start server
async function start() {
  try {
    await sequelize.authenticate()
    await sequelize.sync() // for dev; in prod use migrations
    app.listen(PORT, () => console.log(`Server running on :${PORT}`))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}
start()
