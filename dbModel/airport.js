'use strict'

const { QueryTypes } = require('sequelize')
const Sequelize = require('sequelize')

const { MYSQL_URL } = process.env
const sequelize = new Sequelize(`${MYSQL_URL}/airports`, {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 100,
    handleDisconnects: true,
  },
})
const { Model } = Sequelize
class Airport extends Model {}
Airport.init({
  // attributes
  airport_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  city: {
    type: Sequelize.STRING,
  },
  country: {
    type: Sequelize.STRING,
  },
  IATA: {
    type: Sequelize.CHAR,
    validate: {
      len: 3,
    },
  },
  ICAO: {
    type: Sequelize.CHAR,
    validate: {
      len: 4,
    },
  },
  lat: {
    type: Sequelize.DECIMAL,
  },
  lng: {
    type: Sequelize.DECIMAL,
  },
  altitude: {
    type: Sequelize.INTEGER,
  },
  timezone: {
    type: Sequelize.INTEGER,
  },
}, {
  sequelize,
  modelName: 'airports',
  // options
})

const findNearestAirport = async(lat, lng) => {
  const selectQuery = 'SELECT *, SQRT('
  + `POW(69.1 * (lat - ${lat}), 2) + `
  + `POW(69.1 * (${lng} - lng) * COS(lat / 57.3), 2)) AS distance `
+ 'FROM airports HAVING distance < 50 && iata is not NULL ORDER BY distance;'
  const airports = await sequelize.query(selectQuery,
    {
      model: Airport,
      mapToModel: true,
      type: QueryTypes.SELECT,
    })
  return airports
}
module.exports = {
  Airport,
  sequelize,
  findNearestAirport,
}
