import 'dotenv/config'
import bcrypt from 'bcrypt'
import { sequelize, User, Store, Rating } from './models/index.js'

async function run() {
  try {
    await sequelize.sync({ force: true })

    const adminPass = await bcrypt.hash('Admin@123', 10)
    const ownerPass = await bcrypt.hash('Owner@123', 10)
    const userPass  = await bcrypt.hash('User@1234', 10)

    const admin = await User.create({ name: 'Administrator Account AAA BBB', email: 'admin@demo.com', address: 'HQ, City', passwordHash: adminPass, role: 'ADMIN' })
    const owner = await User.create({ name: 'Store Owner Example QQQ RRR', email: 'owner@demo.com', address: 'Owner Address', passwordHash: ownerPass, role: 'OWNER' })
    const user  = await User.create({ name: 'Normal User Sample XXX YYY', email: 'user@demo.com', address: 'User Address', passwordHash: userPass, role: 'USER' })

    const s1 = await Store.create({ name: 'Fresh Mart', email: 'fresh@store.com', address: '123 Market Street', ownerId: owner.id })
    const s2 = await Store.create({ name: 'Tech Hub', email: 'tech@store.com', address: '42 Silicon Road', ownerId: owner.id })
    const s3 = await Store.create({ name: 'Daily Needs', email: 'daily@store.com', address: '7 Main Bazaar', ownerId: null })

    await Rating.bulkCreate([
      { userId: user.id, storeId: s1.id, rating: 4 },
      { userId: user.id, storeId: s2.id, rating: 5 },
    ])

    console.log('Seed complete. Admin: admin@demo.com / Admin@123')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
run()
