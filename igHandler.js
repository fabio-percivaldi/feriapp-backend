'use strict'

const axios = require('axios')
const logger = require('pino')()
const { Media } = require('./media')
const { IG_ACCESS_TOKEN, IG_CLIENT_ID } = process.env

const igClient = axios.create({
  baseURL: 'https://graph.instagram.com',
  params: {
    access_token: IG_ACCESS_TOKEN,
  },
})


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
              logger.error(allError)
            })
        })
        .catch(error => {
          logger.error(error)
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
