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

const getCountryByCity = async(city, callback) => {
  let googleResponse
  try {
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

module.exports = {
  getCountryByCity,
  getResponseObject,
}
