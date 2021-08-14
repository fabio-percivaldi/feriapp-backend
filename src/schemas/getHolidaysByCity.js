'use strict'

module.exports = {
  params: {
    type: 'object',
    properties: {
      year: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
    },
  },
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: {},
          start: {},
          end: {},
          name: {},
          type: {},
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
