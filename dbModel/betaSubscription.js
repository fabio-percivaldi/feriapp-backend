'use strict'

const Sequelize = require('sequelize')
const { MYSQL_URL } = process.env
const sequelize = new Sequelize(MYSQL_URL, {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 100,
    handleDisconnects: true,
  },
})
const { Model } = Sequelize
class BetaSubscription extends Model {}
BetaSubscription.init({
  // attributes
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  os: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
}, {
  sequelize,
  modelName: 'beta_subscription',
  // options
})
module.exports = {
  BetaSubscription,
  sequelize,
}
