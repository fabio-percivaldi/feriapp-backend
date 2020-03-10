'use strict'

const axios = require('axios')
const logger = require('pino')()
const { RAPID_API_HOST, RAPID_API_KEY, RAPID_API_URL, GOOGLE_API_URL, GOOGLE_API_KEY } = process.env

const airportsfinderClient = axios.create({
  baseURL: RAPID_API_URL,
  headers: {
    'x-rapidapi-host': RAPID_API_HOST,
    'x-rapidapi-key': RAPID_API_KEY,
  },
})
const geoCodingClient = axios.create({
  baseURL: GOOGLE_API_URL,
})

const getNearestAirport = async(city) => {
  const googleResponse = await geoCodingClient.get(`?address=${city}&&key=${GOOGLE_API_KEY}`)
  const [result] = googleResponse.results
  const { geometry } = result
  const { location } = geometry
  const results = await airportsfinderClient.get('airports/nearest', {
    params: {
      'lng': location.lng,
      'lat': location.lat,
    },
  })
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(
      results.data,
    ),
  }
  callback(null, response)
}

module.exports.getFlights = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { query } = event
  const { outboundDate, inboundDate, originCity } = query
  const nearestAirportCity = getNearestAirport(originCity)

  const city = skyScannerClient.get(`autosuggest/v1.0/${origin.country}/EUR/it-IT/?query=${origin.city}`)
}


