import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import teacherRoutes from './routes/teacherRoutes.js'

dotenv.config()

const app = express()

// Connect MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))


// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'College Portal API is running 🚀',
  })
})


// Routes
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/teacher', teacherRoutes)


// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  })
})


// Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
