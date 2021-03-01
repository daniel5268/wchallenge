const signInPropertySchema = { type: 'string', minLength: 1, maxLength: 50 };

module.exports = {
  type: 'object',
  properties: {
    username: signInPropertySchema,
    password: signInPropertySchema,
  },
  additionalProperties: false,
  required: ['username', 'password'],
};
