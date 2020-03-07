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


module.exports.updateIgMedia = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  let mediaIds = []
  await Media.destroy({ truncate: true })

  const listResponse = await igClient.get(`${IG_CLIENT_ID}/media?access_token=${IG_ACCESS_TOKEN}`)
  const { data } = listResponse.data
  const recentMedia = data.slice(0, 5)
  await Promise.all(recentMedia.map(media => {
    return igClient.get(`${media.id}?access_token=${IG_ACCESS_TOKEN}&fields=caption,media_url,permalink`)
  }))
    .then(async responses => {
      mediaIds = responses.map(resp => resp.data.id)

      await Media.bulkCreate(responses.map(response => {
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          mediaIds,
        }),
      }
      callback(null, response)
    })
}
module.exports.getIgMedia = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const mediaList = await Media.findAll()
  const media = mediaList.map(data => data.dataValues)

  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      media,
    }),
  }
  callback(null, response)
}
