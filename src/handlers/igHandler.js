/* eslint-disable max-statements */
'use strict'

const medias = require('./medias.json')

module.exports.getIgMedia = async(req, reply) => {
  const selectedMedias = []
  for (let i = 0; i < 5; i++) {
    selectedMedias.push(medias[Math.floor(Math.random() * medias.length)])
  }
  const response = selectedMedias.map(selectedMedia => {
    return {
      mediaId: selectedMedia.id,
      mediaUrl: selectedMedia.media_url,
      permaurl: selectedMedia.permalink,
      caption: selectedMedia.caption,
      createdAt: '',
      updatedAt: '',
      timestamp: selectedMedia.timestamp,
    }
  })

  reply.send({
    media: response,
  })
}
