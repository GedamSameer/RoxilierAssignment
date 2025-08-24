import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Store = sequelize.define('Store', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        len: { args: [1, 120], msg: 'Store name required.' }
      }
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: true,
      validate: { isEmail: { msg: 'Invalid email.' } }
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: { len: { args: [0, 400], msg: 'Address max 400.' } }
    },
    ownerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  }, {
    tableName: 'stores',
    underscored: true
  })
  return Store
}
