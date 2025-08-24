import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export function auth(required=true) {
  return async (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    if(!token) {
      if(required) return res.status(401).json({ error: 'Unauthorized' })
      else return next()
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
      const user = await User.findByPk(payload.id)
      if(!user) return res.status(401).json({ error: 'Unauthorized' })
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name }
      next()
    } catch(err) {
      console.error('auth error:', err.message)
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if(!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
