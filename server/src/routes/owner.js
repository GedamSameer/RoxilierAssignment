import express from 'express'
import { auth, requireRole } from '../middleware/auth.js'
import { Store, Rating, User } from '../models/index.js'
import { fn, col } from 'sequelize'

const router = express.Router()
router.use(auth(true), requireRole('OWNER'))

// List users who rated owner's stores + average per store
router.get('/dashboard', async (req, res) => {
  try {
    const stores = await Store.findAll({ where: { ownerId: req.user.id } })
    const storeIds = stores.map(s => s.id)

    if(!storeIds.length) return res.json({ stores: [], ratings: [], averages: [] })

    const ratings = await Rating.findAll({
      where: { storeId: storeIds },
      include: [
        { model: User, attributes: ['id','name','email'] },
        { model: Store, attributes: ['id','name'] }
      ],
      order: [['storeId','ASC']]
    })

    const averages = await Rating.findAll({
      where: { storeId: storeIds },
      attributes: ['storeId', [fn('AVG', col('rating')), 'avgRating']],
      group: ['storeId']
    })

    res.json({
      stores,
      ratings: ratings.map(r => ({
        id: r.id, storeId: r.storeId, storeName: r.Store?.name,
        userId: r.userId, userName: r.User?.name, userEmail: r.User?.email,
        rating: r.rating
      })),
      averages
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load owner dashboard' })
  }
})

export default router
