const { digitsStringSchema } = require('../../../utils/Schemas');

module.exports = {
  type: 'object',
  properties: {
    N: digitsStringSchema,
    order: {
      type: 'string',
      enum: ['asc', 'desc'],
    },
  },
};
