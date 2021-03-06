const CreateUsersSchema = require('../src/entities/users/schemas/CreateUsersSchema');
const LoginSchema = require('../src/entities/users/schemas/LoginSchema');
const AddCryptoCoinsSchema = require('../src/entities/users/schemas/AddCryptoCoinsSchema');

module.exports = {
  createUsers: {
    description: 'Endpoint to create new users',
    content: {
      'application/json': {
        schema: CreateUsersSchema,
      },
    },
  },
  login: {
    description: 'The signin information',
    content: {
      'application/json': {
        schema: LoginSchema,
      },
    },
  },
  addCryptoCoin: {
    description: 'a body containing the crypto coin ids, those ids can be consulted in this API',
    content: {
      'application/json': {
        schema: AddCryptoCoinsSchema,
      },
    },
  },
};
