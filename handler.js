'use strict'
const logger = require('pino')()
const Kazzenger = require('./src/kazzenger')
const moment = require('moment')
const axios = require('axios')
const log = require('pino')()
const { Media, sequelize } = require('./media')
const { IG_ACCESS_TOKEN, IG_CLIENT_ID } = process.env

const igClient = axios.create({
  baseURL: 'https://graph.instagram.com',
  params: {
    access_token: IG_ACCESS_TOKEN,
  },
})
module.exports.bridges = (event, context, callback) => {
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const config = { country: 'IT', state: '', region: '', city: 'Milan', daysOff: [0, 6], customHolidays: null }
  const kazzenger = new Kazzenger(config)

  const calculatedBridges = kazzenger.bridges({
    start: moment()
      .subtract(2, 'months')
      .toDate(),
    end: moment()
      .add(2, 'months')
      .toDate(),
    maxHolidaysDistance: 2,
    maxAvailability: 2,
  })
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: JSON.stringify(calculatedBridges),
  }
  callback(null, response)
}

module.exports.updateIgMedia = (event, context, callback) => {
  let mediaIds = []
  Media.sync({ force: true })
    .then(() => {
      igClient.get(`${IG_CLIENT_ID}/media?access_token=${IG_ACCESS_TOKEN}`)
        .then(listResponse => {
          const { data } = listResponse.data
          const recentMedia = data.slice(0, 5)
          Promise.all(recentMedia.map(media => {
            return igClient.get(`${media.id}?access_token=${IG_ACCESS_TOKEN}&fields=caption,media_url,permalink`)
          }))
            .then(responses => {
              mediaIds = responses.map(resp => resp.data.id)
              Media.bulkCreate(responses.map(response => {
                return {
                  mediaId: response.data.id,
                  mediaUrl: response.data.media_url,
                  permaurl: response.data.permalink,
                  caption: response.data.caption,
                }
              }))
              const response = {
                isBase64Encoded: false,
                statusCode: 200,
                headers: {},
                body: JSON.stringify({
                  mediaIds,
                }),
              }
              callback(null, response)
            })
            .catch(allError => {
              log.error(allError)
            })
        })
        .catch(error => {
          log.error(error)
        })
    })
}
module.exports.getIgMedia = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  let media = []
  Media.findAll().then(async res => {
    media = res.map(data => data.dataValues)
    const response = {
      isBase64Encoded: false,
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        media,
      }),
    }
    callback(null, response)
  })
}
