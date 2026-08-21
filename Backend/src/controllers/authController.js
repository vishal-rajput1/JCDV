import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      rollNo,
      employeeId,
      department,
      semester,
      field,
    } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
      rollNo,
      employeeId,
      department,
      semester,
      field,
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}


export const loginUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body

    if (!identifier || !password || !role) {
      return res.status(400).json({
        message: 'Identifier, password and role are required',
      })
    }

    const cleanIdentifier = identifier.trim()
    const cleanEmail = cleanIdentifier.toLowerCase()

    let user

if (role === 'student') {
  user = await User.findOne({
    role: 'student',
    $or: [
      { rollNo: cleanIdentifier },
      { studentId: cleanIdentifier },
      { email: cleanEmail },
    ],
  })
}

    else if (role === 'teacher') {
      user = await User.findOne({
        role: 'teacher',
        $or: [
          { employeeId: cleanIdentifier },
          { email: cleanEmail },
        ],
      })
    }

    else if (role === 'admin') {
      user = await User.findOne({
        role: 'admin',
        email: cleanEmail,
      })
    }

    else {
      return res.status(400).json({
        message: 'Invalid role',
      })
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid login credentials',
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid login credentials',
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    res.json({
      message: 'Login successful',

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        studentId: user.studentId,
        rollNo: user.rollNo,
        employeeId: user.employeeId,

        department: user.department,
        semester: user.semester,
        field: user.field,
      },
    })

  } catch (error) {
    console.error('LOGIN ERROR:', error)

    res.status(500).json({
      message: 'Server error',
    })
  }
}
