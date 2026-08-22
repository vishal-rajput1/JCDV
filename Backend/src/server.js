import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const app = express()

// ===============================
// DATABASE
// ===============================

connectDB()

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ===============================
// HEALTH CHECK
// ===============================

app.get('/', (req, res) => {
  res.json({
    message: 'College Portal API is running 🚀',
  })
})

// ===============================
// API ROUTES
// ===============================

app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/admin', adminRoutes)

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err)

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  })
})

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})