'use strict'

const axios = require('axios')
const moment = require('moment')
const {
  AERODATABOX_API_HOST,
  RAPID_API_KEY,
  GOOGLE_API_URL,
  GOOGLE_API_KEY,
  SKYSCANNER_API_HOST,
} = process.env
const { getResponseObject, getCountryByCity } = require('./common')

const airportsfinderClient = axios.create({
  baseURL: `https://${AERODATABOX_API_HOST}`,
  headers: {
    'x-rapidapi-host': AERODATABOX_API_HOST,
    'x-rapidapi-key': RAPID_API_KEY,
  },
})
const skyScannerClient = axios.create({
  baseURL: `https://${SKYSCANNER_API_HOST}`,
  headers: {
    'x-rapidapi-host': SKYSCANNER_API_HOST,
    'x-rapidapi-key': RAPID_API_KEY,
  },
})
const getNearestAirportCity = async(city) => {
  const googleResponse = await axios.get(`${GOOGLE_API_URL}?address=${city}&&key=${GOOGLE_API_KEY}`)
  const [result] = googleResponse.data.results
  const { geometry } = result
  const { location } = geometry
  const results = await airportsfinderClient.get(`/airports/search/location/${location.lat}/${location.lng}/km/100/5`)
  const [nearestResult] = results.data.items
  if (nearestResult) {
    return nearestResult.municipalityName
  }
  return null
}

module.exports.getFlights = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters } = event
  const { outboundDate, inboundDate, originCity } = queryStringParameters
  const nearestAirportCity = await getNearestAirportCity(originCity)
  const country = await getCountryByCity(originCity)
  const suggestion = await skyScannerClient.get(`/apiservices/autosuggest/v1.0/${country}/EUR/it-IT/?query=${nearestAirportCity}`)
  const { data } = suggestion

  const originPlaceSkyId = data.Places[0].PlaceId

  const results = await skyScannerClient.get(`/apiservices/browseroutes/v1.0/IT/EUR/it-IT/${originPlaceSkyId}/anywhere/${moment(outboundDate).format('YYYY-MM-DD')}/${moment(inboundDate).format('YYYY-MM-DD')}`)

  const { data: flightResponse } = results

  const { Routes, Places, Quotes } = flightResponse
  const filteredRoutes = Routes.filter(route => Boolean(route.QuoteIds && route.Price))
  const sortedFlights = filteredRoutes.sort((f1, f2) => {
    if (f1.Price < f2.Price) {
      return -1
    }
    if (f1.Price > f2.Price) {
      return 1
    }
    return 0
  })
  const cheapestFlights = sortedFlights.slice(0, 5)

  cheapestFlights.forEach(flight => {
    flight.InboundDate = moment(inboundDate).format('YYYY-MM-DD')
    flight.OutboundDate = moment(outboundDate).format('YYYY-MM-DD')
    const quotes = Quotes.filter(quote => flight.QuoteIds.includes(quote.QuoteId))
    if (quotes) {
      flight.Quotes = quotes
    }
    flight.Quotes.forEach(quote => {
      const quotePlace = Places.find(place => place.PlaceId === quote.OutboundLeg.DestinationId)
      quote.DestinationPlace = quotePlace
    })
    const originPlace = Places.find(place => place.PlaceId === flight.OriginId)
    if (originPlace) {
      flight.OriginPlace = originPlace
    }
    const destinationPlace = Places.find(place => place.PlaceId === flight.DestinationId)
    if (destinationPlace) {
      flight.DestinationPlace = destinationPlace
    }
  })

  const response = getResponseObject(200, cheapestFlights)
  callback(null, response)
}


