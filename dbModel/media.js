'use strict'

const Sequelize = require('sequelize')
const { MYSQL_URL } = process.env
const sequelize = new Sequelize(`${MYSQL_URL}/ig`, {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 100,
    handleDisconnects: true,
  },
})
const { Model } = Sequelize
class Media extends Model {}
Media.init({
  // attributes
  mediaId: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  mediaUrl: {
    type: Sequelize.STRING,
    // allowNull defaults to true
  },
  permaurl: {
    type: Sequelize.STRING,
  },
  caption: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.STRING,
  },
}, {
  sequelize,
  modelName: 'media',
  // options
})
module.exports = {
  Media,
  sequelize,
}
