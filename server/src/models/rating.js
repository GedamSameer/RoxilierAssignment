import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Rating = sequelize.define('Rating', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    storeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    rating: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Rating must be between 1 and 5.' },
        max: { args: [5], msg: 'Rating must be between 1 and 5.' }
      }
    }
  }, {
    tableName: 'ratings',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'store_id'] }
    ]
  })
  return Rating
}
