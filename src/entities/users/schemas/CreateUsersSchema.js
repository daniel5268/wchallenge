const stringSchema = { type: 'string', minLength: 2, maxLength: 50 };

const namesSchema = {
  ...stringSchema, pattern: '^[A-Za-z]+$',
};

const alphaNumericSchema = {
  ...stringSchema, pattern: '^[A-Za-z0-9]+$',
};

module.exports = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: namesSchema,
      last_name: namesSchema,
      username: alphaNumericSchema,
      password: { ...alphaNumericSchema, minLength: 8 },
      preferred_coin: { type: 'string', enum: ['EUR', 'USD', 'ARS'] },
    },
    additionalProperties: false,
    required: ['name', 'last_name', 'username', 'password', 'preferred_coin'],
  },
  minItems: 1,
};
