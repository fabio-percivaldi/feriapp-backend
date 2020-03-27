/* eslint-disable camelcase */
/* eslint-disable max-statements */
'use strict'

const axios = require('axios')
const moment = require('moment')
const { findNearestAirport } = require('../dbModel/airport')
const {
  RAPID_API_KEY,
  GOOGLE_API_URL,
  GOOGLE_API_KEY,
  SKYSCANNER_API_HOST,
  TRAVELPAYOUT_MARKER,
} = process.env
const { getResponseObject, getCountryByCity } = require('../common')
const BASE_REFERRAL_URL = 'https://search.jetradar.com/flights/?'

const skyScannerClient = axios.create({
  baseURL: `https://${SKYSCANNER_API_HOST}`,
  headers: {
    'x-rapidapi-host': SKYSCANNER_API_HOST,
    'x-rapidapi-key': RAPID_API_KEY,
  },
})

const getNearestAirportCity = async(city, callback) => {
  let googleResponse
  try {
    googleResponse = await axios.get(`${GOOGLE_API_URL}/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`)
  } catch (gerror) {
    const errorResponse = getResponseObject(500, {
      errorMessage: 'Google geocode API error',
      error: gerror,
    })
    return callback(errorResponse, null)
  }
  const [result] = googleResponse.data.results
  const { geometry } = result
  const { location } = geometry
  const { lat, lng } = location
  let results
  try {
    results = await findNearestAirport(lat, lng)
  } catch (airportError) {
    const errorResponse = getResponseObject(500, {
      errorMessage: 'Airports finder API error',
      error: airportError,
    })
    return callback(errorResponse, null)
  }
  const [nearestResult] = results
  if (nearestResult) {
    return nearestResult.city
  }
  return null
}
const generateReferralLink = (flight) => {
  const originIata = flight.OriginPlace.IataCode
  const destinationIata = flight.quote.DestinationPlace.IataCode
  const inboundDate = flight.InboundDate
  const outboundDate = flight.OutboundDate
  return `${BASE_REFERRAL_URL}origin_iata=${originIata}\
&destination_iata=${destinationIata}\
&depart_date=${outboundDate}\
&return_date=${inboundDate}\
&with_request=false\
&adults=1\
&children=0\
&infants=0\
&trip_class=0\
&locale=en\
&one_way=false\
&marker=${TRAVELPAYOUT_MARKER}`
}
const getFlightsResponse = (cheapestFlights, Quotes, Places, inboundDate, outboundDate) => {
  cheapestFlights.forEach(flight => {
    flight.InboundDate = moment(inboundDate).format('YYYY-MM-DD')
    flight.OutboundDate = moment(outboundDate).format('YYYY-MM-DD')
    const quotes = Quotes.filter(quote => flight.QuoteIds.includes(quote.QuoteId))
    if (quotes) {
      [flight.quote] = quotes
    }
    const quotePlace = Places.find(place => place.PlaceId === flight.quote.OutboundLeg.DestinationId)
    flight.quote.DestinationPlace = quotePlace
    const originPlace = Places.find(place => place.PlaceId === flight.OriginId)
    if (originPlace) {
      flight.OriginPlace = originPlace
    }
    const destinationPlace = Places.find(place => place.PlaceId === flight.DestinationId)
    if (destinationPlace) {
      flight.DestinationPlace = destinationPlace
    }
  })
  return cheapestFlights.map(flight => {
    return {
      originPlace: {
        iataCode: flight.OriginPlace.IataCode,
        name: flight.OriginPlace.Name,
        type: flight.OriginPlace.Type,
        cityId: flight.OriginPlace.CityId,
        countryName: flight.OriginPlace.CountryName,
      },
      destinationPlace: {
        iataCode: flight.quote.DestinationPlace.IataCode,
        name: flight.quote.DestinationPlace.Name,
        type: flight.quote.DestinationPlace.Type,
        cityId: flight.quote.DestinationPlace.CityId,
        countryName: flight.quote.DestinationPlace.CountryName,
      },
      price: flight.Price,
      direct: flight.quote.Direct,
      referralLink: generateReferralLink(flight),
      inboundDate: flight.InboundDate,
      outboundDate: flight.OutboundDate,
    }
  })
}
module.exports.flights = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters } = event
  const { outboundDate, inboundDate, originCity, currency = 'USD', locale = 'en-EN' } = queryStringParameters
  const nearestAirportCity = await getNearestAirportCity(originCity, callback)
  const country = await getCountryByCity(originCity)
  let suggestion
  try {
    suggestion = await skyScannerClient.get(`/apiservices/autosuggest/v1.0/${country}/${currency}/${locale}/?query=${nearestAirportCity}`)
  } catch (error) {
    const errorResponse = getResponseObject(500, {
      errorMessage: 'Skyscanner API error',
      error,
    })
    return callback(errorResponse, null)
  }
  const { data } = suggestion

  const originPlaceSkyId = data.Places[0].PlaceId
  let results
  try {
    results = await skyScannerClient.get(`/apiservices/browseroutes/v1.0/${country}/${currency}/${locale}/${originPlaceSkyId}/anywhere/${moment(outboundDate).format('YYYY-MM-DD')}/${moment(inboundDate).format('YYYY-MM-DD')}`)
  } catch (error) {
    const errorResponse = getResponseObject(500, {
      errorMessage: 'Skyscanner API error',
      error,
    })
    return callback(errorResponse, null)
  }
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
  const cleanFlightsResponse = getFlightsResponse(cheapestFlights, Quotes, Places, inboundDate, outboundDate)


  const response = getResponseObject(200, cleanFlightsResponse)
  callback(null, response)
}

module.exports.cityPhoto = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { queryStringParameters } = event
  const { city, maxWidth = 400, maxHeight = 400 } = queryStringParameters
  let placeResponse
  try {
    placeResponse = await axios.get(`${GOOGLE_API_URL}/geocode/json?address=${city}&key=${GOOGLE_API_KEY}`)
  } catch (error) {
    const response = getResponseObject(500, error)
    return callback(response)
  }

  const [result] = placeResponse.data.results
  const { place_id } = result
  let placeDetail
  try {
    placeDetail = await axios.get(`${GOOGLE_API_URL}/place/details/json?place_id=${place_id}&fields=photos&key=${GOOGLE_API_KEY}`)
  } catch (error) {
    const response = getResponseObject(500, error)
    return callback(response)
  }
  const { photos } = placeDetail.data.result
  const [photo] = photos
  const { photo_reference } = photo

  let photoDetail
  try {
    photoDetail = await axios.get(`${GOOGLE_API_URL}/place/photo?photoreference=${photo_reference}&maxwidth=${maxWidth}&maxheight=${maxHeight}&fields=photos&key=${GOOGLE_API_KEY}`, {
      responseType: 'arraybuffer',
    })
  } catch (error) {
    const response = getResponseObject(500, error)
    return callback(response)
  }
  const response = {
    'statusCode': 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': photoDetail.headers['content-type'],
    },
    body: photoDetail.data.toString('base64'),
    'isBase64Encoded': true,
  }
  callback(null, response)
}

