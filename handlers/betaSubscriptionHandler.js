'use strict'

const logger = require('pino')()
const { BetaSubscription } = require('../dbModel/betaSubscription')
const { getResponseObject } = require('../common')

module.exports.betaSubscribe = async(event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const requestBody = JSON.parse(event.body)
  const { email, os } = requestBody
  const result = await BetaSubscription.create({ email, os })
  const response = getResponseObject(200, result)
  callback(null, response)
}
