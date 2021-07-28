/* eslint-disable max-statements */
'use strict'
const logger = require('pino')()
const Kazzenger = require('../kazzenger')
const moment = require('moment')

const Holidays = require('date-holidays')
const PUBLIC_HOLIDAY = 'public'

const { getCountryByCity } = require('../../common')

module.exports.bridges = async(req, reply) => {
  const { body } = req
  const { dayOfHolidays, customHolidays, city, daysOff } = body
  const country = await getCountryByCity(city, reply)
  const config = { country, daysOff, customHolidays }
  const kazzenger = new Kazzenger(config)
  const now = new Date()
  const calculatedBridges = kazzenger
    .bridgesByYears({
      start: now,
      end: new Date(`${now.getFullYear() + 2}-12-31T12:00:00Z`),
      maxHolidaysDistance: 4,
      maxAvailability: dayOfHolidays,
    })
    .map(years => {
      const scores = []
      years.bridges.forEach(bridge => {
        bridge.rate = kazzenger.rateBridge(bridge)
        if (bridge.rate > 70) {
          scores.push(bridge.rate)
        }
        bridge.id = `${moment(bridge.start).format('YYYY-MM-DD')}-${moment(bridge.end).format('YYYY-MM-DD')}`
      })
      scores.sort().reverse()
      years.bridges.forEach(bridge => {
        const index = scores.indexOf(bridge.rate)
        bridge.isTop = index >= 0 && index < 2
      })
      return years
    })

  reply.send(calculatedBridges)
}

module.exports.getHolidaysByCity = async(req, reply) => {
  const { query } = req
  const { city } = query

  let country
  try {
    country = await getCountryByCity(city)
  } catch (error) {
    logger.error('Google APIs error: ', error.message)
  }
  const holidaysLib = new Holidays()
  holidaysLib.init(country)

  const publicHolidays = holidaysLib.getHolidays()
    .filter(holiday => holiday.type === PUBLIC_HOLIDAY)

  reply.send(publicHolidays)
}
