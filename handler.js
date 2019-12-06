'use strict'
const logger = require('pino')()
const Kazzenger = require('./src/kazzenger')
const moment = require('moment')

module.exports.bridges = (event, context, callback) => {
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const config = { country: 'IT', state: '', region: '', city: 'Milan', daysOff: [0, 6], customHolidays: null }
  const kazzenger = new Kazzenger(config)

  const response = kazzenger.bridges({
    start: moment()
      .subtract(2, 'months')
      .toDate(),
    end: moment()
      .add(2, 'months')
      .toDate(),
    maxHolidaysDistance: 2,
    maxAvailability: 2,
  })
  callback(null, response)
}
