'use strict'
const logger = require('pino')()
const axios = require('axios')

const { GOOGLE_API_URL, GOOGLE_API_KEY } = process.env

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

const getCountryByCity = async(city, reply) => {
  let googleResponse
  try {
    googleResponse = await axios.get(`${GOOGLE_API_URL}/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`)
  } catch (error) {
    logger.error('Google geocoding API error', error)
    reply.code(500)
    return reply.send({
      errorMessage: 'Google geocoding API error',
    })
  }
  const [result] = googleResponse.data.results
  const { address_components } = result
  const country = address_components.find(address => address.types.includes('country'))
  if (!country) {
    reply.code(500)
    return reply.send({
      errorMessage: `No country found given the input city: ${city}`,
    })
  }
  logger.info('Country found', { country })
  return country.short_name
}

module.exports = {
  getCountryByCity,
  getResponseObject,
}
