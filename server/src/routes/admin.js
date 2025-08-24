import express from 'express'
import { Op, fn, col, literal } from 'sequelize'
import { User, Store, Rating } from '../models/index.js'
import { auth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { validateAddress, validateEmail, validateName, validatePassword } from '../utils/validators.js'

const router = express.Router()

// All admin routes require admin
router.use(auth(true), requireRole('ADMIN'))

// Stats: total users, stores, ratings
router.get('/stats', async (_req, res) => {
  try {
    const [users, stores, ratings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count()
    ])
    res.json({ users, stores, ratings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Create user (admin can add normal/admin/owner)
router.post('/users',
  validate([validateName(), validateEmail(), validateAddress(), validatePassword()]),
  async (req, res) => {
    try {
      const { name, email, address, password, role='USER' } = req.body
      if(!['USER','ADMIN','OWNER'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
      const existing = await User.findOne({ where: { email } })
      if(existing) return res.status(400).json({ error: 'Email already registered' })
      const bcrypt = (await import('bcrypt')).default
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({ name, email, address, passwordHash, role })
      res.json({ id: user.id, email: user.email, role: user.role })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
)

// List users with filters & sorting
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy='name', order='ASC', page='1', limit='10' } = req.query
    const where = {}
    if(name) where.name = { [Op.like]: `%${name}%` }
    if(email) where.email = { [Op.like]: `%${email}%` }
    if(address) where.address = { [Op.like]: `%${address}%` }
    if(role) where.role = role

    const offset = (Number(page)-1) * Number(limit)
    const { rows, count } = await User.findAndCountAll({
      where,
      order: [[String(sortBy), String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
      limit: Number(limit),
      offset
    })
    res.json({ items: rows, total: count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

// Get user details (include rating if they are owner)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if(!user) return res.status(404).json({ error: 'Not found' })

    let ownerRatings = null
    if(user.role === 'OWNER') {
      // average ratings across their stores
      const stores = await Store.findAll({ where: { ownerId: user.id }, attributes: ['id','name'] })
      if(stores.length) {
        const storeIds = stores.map(s => s.id)
        const rows = await Rating.findAll({
          attributes: ['storeId', [fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
          where: { storeId: { [Op.in]: storeIds } },
          group: ['storeId']
        })
        ownerRatings = { stores, stats: rows }
      } else {
        ownerRatings = { stores: [], stats: [] }
      }
    }
    res.json({ user, ownerRatings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Create store
router.post('/stores',
  validate([
    (req)=> (req.body?.name ? null : 'Store name required'),
    validateEmail('email'),
    validateAddress('address')
  ]),
  async (req, res) => {
    try {
      const { name, email, address, ownerId } = req.body
      const store = await Store.create({ name, email, address, ownerId: ownerId || null })
      res.json(store)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to create store' })
    }
  }
)

// List stores with filters & sorting (admin view)
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy='name', order='ASC', page='1', limit='10' } = req.query
    const where = {}
    const { Op } = await import('sequelize')
    if(name) where.name = { [Op.like]: `%${name}%` }
    if(email) where.email = { [Op.like]: `%${email}%` }
    if(address) where.address = { [Op.like]: `%${address}%` }

    const offset = (Number(page)-1) * Number(limit)

    // include avg rating
    const stores = await Store.findAll({
      where,
      order: [[String(sortBy), String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
      limit: Number(limit),
      offset
    })

    const storeIds = stores.map(s => s.id)
    let ratingMap = {}
    if(storeIds.length) {
      const rows = await Rating.findAll({
        attributes: ['storeId', [fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
        where: { storeId: { [Op.in]: storeIds } },
        group: ['storeId']
      })
      ratingMap = Object.fromEntries(rows.map(r => [r.storeId, { avg: Number(r.get('avgRating')), count: Number(r.get('count')) }]))
    }

    const items = stores.map(s => ({
      id: s.id, name: s.name, email: s.email, address: s.address,
      rating: ratingMap[s.id]?.avg ?? null, ratingCount: ratingMap[s.id]?.count ?? 0
    }))

    const total = await Store.count({ where })
    res.json({ items, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list stores' })
  }
})

export default router
