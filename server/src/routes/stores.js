import express from 'express'
import { Op, fn, col } from 'sequelize'
import { auth } from '../middleware/auth.js'
import { Rating, Store, User } from '../models/index.js'
import { validate } from '../middleware/validate.js'
import { validateRating } from '../utils/validators.js'

const router = express.Router()

// Public/Authed list of stores with search + my rating
router.get('/stores', auth(false), async (req, res) => {
  try {
    const { q, name, address, sortBy='name', order='ASC', page='1', limit='10' } = req.query
    const where = {}
    if(q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { address: { [Op.like]: `%${q}%` } }
      ]
    }
    if(name) where.name = { [Op.like]: `%${name}%` }
    if(address) where.address = { [Op.like]: `%${address}%` }

    const offset = (Number(page)-1) * Number(limit)

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
        attributes: ['storeId', [fn('AVG', col('rating')), 'avgRating']],
        where: { storeId: { [Op.in]: storeIds } },
        group: ['storeId']
      })
      ratingMap = Object.fromEntries(rows.map(r => [r.storeId, Number(r.get('avgRating'))]))
    }

    // My ratings
    let myRatings = {}
    if(req.user && storeIds.length) {
      const my = await Rating.findAll({ where: { userId: req.user.id, storeId: { [Op.in]: storeIds } } })
      myRatings = Object.fromEntries(my.map(r => [r.storeId, r.rating]))
    }

    const items = stores.map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      overallRating: ratingMap[s.id] ?? null,
      myRating: myRatings[s.id] ?? null
    }))
    const total = await Store.count({ where })
    res.json({ items, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list stores' })
  }
})

// Submit or update rating for a store
router.post('/stores/:id/rate',
  auth(true),
  validate([validateRating('rating')]),
  async (req, res) => {
    try {
      const storeId = Number(req.params.id)
      const { rating } = req.body
      const store = await Store.findByPk(storeId)
      if(!store) return res.status(404).json({ error: 'Store not found' })

      // Upsert
      const [rec, created] = await Rating.findOrCreate({
        where: { userId: req.user.id, storeId },
        defaults: { rating }
      })
      if(!created) {
        rec.rating = rating
        await rec.save()
      }
      res.json({ ok: true, rating: rec.rating })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to submit rating' })
    }
  }
)

export default router
