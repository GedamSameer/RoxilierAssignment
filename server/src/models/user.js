import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: { args: [20, 60], msg: 'Name must be 20-60 characters.' }
      }
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Invalid email.' }
      }
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: {
        len: { args: [0, 400], msg: 'Address max 400 characters.' }
      }
    },
    passwordHash: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'USER', 'OWNER'),
      allowNull: false,
      defaultValue: 'USER'
    }
  }, {
    tableName: 'users',
    underscored: true
  })
  return User
}
