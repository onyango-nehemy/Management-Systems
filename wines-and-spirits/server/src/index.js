import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes    from './routes/auth.js'
import productRoutes from './routes/products.js'
import salesRoutes   from './routes/sales.js'
import userRoutes    from './routes/users.js'
import dashboardRoutes from './routes/dashboard.js'
import stockRoutes   from './routes/stock.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
//cors
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL, 
].filter(Boolean)

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales',    salesRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/stock',    stockRoutes)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'Biggie Chill API running' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Biggie backend  running on http://localhost:${PORT}`)
})