'use strict'

module.exports = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          mediaId: {
            type: 'string',
            description: 'If of the media',
          },
          mediaUrl: {
            type: 'string',
            description: 'Url of the image to display',
          },
          permaurl: {
            type: 'string',
            description: 'Url of the instagram post',
          },
          caption: {
            type: 'string',
            description: 'Caption of the image',
          },
          createdAt: {
            type: 'string',
          },
          updatedAt: {
            type: 'string',
          },
        },
      },
    },
    500: {
      type: 'object',
      properties: {
        errorMessage: {
          type: 'string',
        },
      },
    },
  },
}
