import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { auth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateAddress, validateEmail, validateName, validatePassword } from '../utils/validators.js'

const router = express.Router()

// Normal user signup
router.post('/signup',
  validate([validateName(), validateEmail(), validateAddress(), validatePassword()]),
  async (req, res) => {
    try {
      const { name, email, address, password } = req.body
      const existing = await User.findOne({ where: { email } })
      if(existing) return res.status(400).json({ error: 'Email already registered' })
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({ name, email, address, passwordHash, role: 'USER' })
      return res.json({ id: user.id, email: user.email })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to signup' })
    }
  }
)

// Login (all roles)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if(!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Change password
router.post('/change-password',
  auth(true),
  validate([validatePassword('newPassword')]),
  async (req, res) => {
    try {
      const { newPassword } = req.body
      const passwordHash = await bcrypt.hash(newPassword, 10)
      await User.update({ passwordHash }, { where: { id: req.user.id } })
      res.json({ ok: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to change password' })
    }
  }
)

export default router
