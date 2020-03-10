/* eslint-disable max-statements */
'use strict'
const logger = require('pino')()
const Kazzenger = require('./src/kazzenger')
const moment = require('moment')
const axios = require('axios')
const { GOOGLE_API_URL, GOOGLE_API_KEY } = process.env
const Holidays = require('date-holidays')
const PUBLIC_HOLIDAY = 'public'

const getResponseObject = (statusCode, body) => {
  return {
    isBase64Encoded: false,
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  }
}
const getCountryByCity = async(city, callback) => {
  let googleResponse
  try {
    // googleResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=cologne&key=AIzaSyBht1qyrs-X0sfzx2IDnCmxW4MT7sg_A6s')
    googleResponse = await axios.get(`${GOOGLE_API_URL}?address=${city}&key=${GOOGLE_API_KEY}`)
  } catch (error) {
    logger.error('Google geocoding API error', error)
    const errorResponse = getResponseObject(500, {
      errorMessage: 'Google geocoding API error',
    })
    return callback(errorResponse, null)
  }
  const [result] = googleResponse.data.results
  const { address_components } = result
  const country = address_components.find(address => address.types.includes('country'))
  if (!country) {
    const errorResponse = getResponseObject(500, {
      errorMessage: `No country found given the input city: ${city}`,
    })
    return callback(errorResponse, null)
  }
  logger.info('Country found', { country })
  return country.short_name
}
module.exports.bridges = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const requestBody = JSON.parse(event.body)
  const { dayOfHolidays, customHolidays, city, daysOff } = requestBody
  const country = await getCountryByCity(city)
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
        bridge.isSelected = false
      })
      scores.sort().reverse()
      years.bridges.forEach(bridge => {
        const index = scores.indexOf(bridge.rate)
        bridge.isTop = index >= 0 && index < 2
      })
      return years
    })

  const response = getResponseObject(200, calculatedBridges)
  callback(null, response)
}

module.exports.getHolidaysByCity = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const { queryStringParameters } = event
  const { city } = queryStringParameters

  const country = await getCountryByCity(city)
  const holidaysLib = new Holidays()
  holidaysLib.init(country)

  const publicHolidays = holidaysLib.getHolidays()
    .filter(holiday => holiday.type === PUBLIC_HOLIDAY)
  return getResponseObject(200, publicHolidays)
}
