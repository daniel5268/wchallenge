module.exports = {
  apiKey: {
    in: 'header',
    name: 'api_key',
    description: 'A key to consume some of the api endpoints, please contact administrator to obtain it',
    schema: {
      type: 'string',
      example: 'thisIsAnAPiKeyForThisAPI',
    },
    required: true,
  },
  token: {
    in: 'header',
    name: 'TOKEN',
    description: 'a JWT (Json web token), containing the information to identify the user in future requests',
    schema: {
      type: 'string',
      example: 'AGSRRVASSDHFDFVABDFadfagAbadfADGA',
    },
    required: true,
  },
  pathUserId: {
    in: 'path',
    name: 'userId',
    description: 'The target operation user_id',
    schema: {
      type: 'integer',
      example: 1,
    },
    required: true,
  },
  page: {
    in: 'query',
    name: 'page',
    description: 'The page to consult the existing crypto coins',
    schema: {
      type: 'string',
      example: '5',
    },
    required: false,
  },
  perPage: {
    in: 'query',
    name: 'per_page',
    description: 'The number of crypto coins per page',
    schema: {
      type: 'string',
      example: '25',
    },
    required: false,
  },
};
