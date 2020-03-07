'use strict'
const logger = require('pino')()
const Kazzenger = require('./src/kazzenger')
const moment = require('moment')

module.exports.bridges = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const requestBody = JSON.parse(event.body)
  const { dayOfHolidays, customHolidays, country, state, region, city, daysOff } = requestBody

  const config = { country, state, region, city, daysOff, customHolidays }
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
        bridge.isSelected = false
      })
      scores.sort().reverse()
      years.bridges.forEach(bridge => {
        const index = scores.indexOf(bridge.rate)
        bridge.isTop = index >= 0 && index < 2
      })
      return years
    })

  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(calculatedBridges),
  }
  callback(null, response)
}
