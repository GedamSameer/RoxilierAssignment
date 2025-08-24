import { Sequelize } from 'sequelize'
import 'dotenv/config'

const {
  DB_HOST='localhost',
  DB_PORT='3306',
  DB_USER='root',
  DB_PASS='password',
  DB_NAME='ratings_app'
} = process.env

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
})

import UserModel from './user.js'
import StoreModel from './store.js'
import RatingModel from './rating.js'

export const User = UserModel(sequelize)
export const Store = StoreModel(sequelize)
export const Rating = RatingModel(sequelize)

// Associations
User.hasMany(Store, { as: 'ownedStores', foreignKey: 'ownerId' })
Store.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' })

User.hasMany(Rating, { foreignKey: 'userId' })
Store.hasMany(Rating, { foreignKey: 'storeId' })
Rating.belongsTo(User, { foreignKey: 'userId' })
Rating.belongsTo(Store, { foreignKey: 'storeId' })
