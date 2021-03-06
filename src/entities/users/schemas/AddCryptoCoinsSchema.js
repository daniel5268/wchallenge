module.exports = {
  type: 'object',
  properties: {
    crypto_coin_ids: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
      },
      minItems: 1,
      uniqueItems: true,
    },
  },
  required: ['crypto_coin_ids'],
  additionalProperties: false,
};
