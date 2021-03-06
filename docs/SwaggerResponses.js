module.exports = {
  createdUsers: {
    description: 'The created users information (excluding password)',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Mike' },
              last_name: { type: 'string', example: 'Mendez' },
              username: { type: 'string', example: 'Mike' },
              preferred_coin: { type: 'string', example: 'ARS' },
              created_at: {
                type: 'string',
                format: 'date-time',
                example: '2020-05-27T03:02:33Z',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                example: '2020-05-27T03:02:33Z',
              },
            },
          },
        },
      },
    },
  },
  tokenInfo: {
    description: 'The token to consume with the expiration time in seconds',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'ASDFDSAasdfasdASGWESRsafgsDGASRSfgasGRAsrH' },
            expiration_time: { type: 'integer', example: 7200 },
          },
        },
      },
    },
  },
  createdUsersCryptoCoins: {
    description: 'The created users crypto coins (relation between the user and the crypto coin)',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              user_id: { type: 'integer', example: 2 },
              crypto_coin_id: { type: 'integer', example: 3 },
              created_at: {
                type: 'string',
                format: 'date-time',
                example: '2020-05-27T03:02:33Z',
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                example: '2020-05-27T03:02:33Z',
              },
            },
          },
        },
      },
    },
  },
  cryptoCoins: {
    description: 'The best paid crypto coins in the user\'s preferred coin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'bitcoin' },
              name: { type: 'string', example: 'Bitcoin' },
              symbol: { type: 'string', example: 'btc' },
              image: { type: 'string', example: 'www.images.com/2' },
              price: { type: 'number', example: 12434.50 },
              last_updated: {
                type: 'string',
                format: 'date',
              },
            },
          },
        },
      },
    },
  },
  topUsersCryptoCoins: {
    description: 'The best paid crypto coins in the user\'s preferred coin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'bitcoin' },
              name: { type: 'string', example: 'Bitcoin' },
              symbol: { type: 'string', example: 'btc' },
              image: { type: 'string', example: 'www.images.com/2' },
              ars_price: { type: 'number', example: 12434.50 },
              uer_price: { type: 'number', example: 12434.50 },
              usd_price: { type: 'number', example: 12434.50 },
              last_updated: {
                type: 'string',
                format: 'date',
              },
            },
          },
        },
      },
    },
  },
  healthCheck: {
    description: 'Endpoint to check if the service is available',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            service_status: {
              type: 'string',
              example: 'ok',
            },
          },
        },
      },
    },
  },
  error: {
    description: 'An error will be returned with the most accurate status and a message describing what occurred',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              example: 404,
            },
            message: {
              type: 'string',
              example: 'Not found',
            },
          },
        },
      },
    },
  },
};
