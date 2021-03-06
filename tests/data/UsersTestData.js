const UsersTestData = module.exports;

const { cryptoCoins } = require('./CryptoCoinsTestData');
const JWT = require('../../src/utils/JWT');

UsersTestData.repeatedUsername = 'wolox';

UsersTestData.successfulCreateUsersBody = [
  {
    name: 'wolox',
    last_name: 'awesome',
    username: this.repeatedUsername,
    password: '12345678',
    preferred_coin: 'USD',
  },
  {
    name: 'saul',
    last_name: 'goodman',
    username: 'billie',
    password: '87654321',
    preferred_coin: 'EUR',
  },
];

[UsersTestData.user] = this.successfulCreateUsersBody;

UsersTestData.successfulLoginBody = {
  username: this.user.username,
  password: this.user.password,
};

UsersTestData.expectedVerifiedToken = {
  user_id: 1,
  username: this.user.username,
};

UsersTestData.token = JWT.generateToken(this.expectedVerifiedToken);

UsersTestData.invalidUserId = 1234123;

UsersTestData.invalidUserToken = JWT.generateToken({ user_id: this.invalidUserId, username: 'wat' });

UsersTestData.usernames = this.successfulCreateUsersBody.map((user) => user.username);

UsersTestData.duplicateUsernameCreateUsersBody = [
  ...this.successfulCreateUsersBody,
  {
    name: 'walter',
    last_name: 'white',
    username: this.repeatedUsername,
    password: '12345678',
    preferred_coin: 'USD',
  },
];

UsersTestData.expectedCreateUsersResponseBody = this.successfulCreateUsersBody.map((userInfo) => {
  const { password, ...restUserInfo } = userInfo;

  return restUserInfo;
});

UsersTestData.getCreateUserBodyWithoutRequiredProperty = (property) => {
  const [{ [property]: _, ...incompleteUser }] = this.successfulCreateUsersBody;

  return [incompleteUser];
};

UsersTestData.successfulAddCryptoCoinsBody = {
  crypto_coin_ids: cryptoCoins.map(({ external_id: externalId }) => externalId),
};

UsersTestData.expectedCreatedUsersCryptoCoins = [
  { user_id: 1, crypto_coin_id: 1 },
  { user_id: 1, crypto_coin_id: 2 },
  { user_id: 1, crypto_coin_id: 3 },
];
