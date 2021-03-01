const UsersTestData = module.exports;

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

UsersTestData.getBodyWithoutRequiredProperty = (property) => {
  const [{ [property]: _, ...incompleteUser }] = this.successfulCreateUsersBody;

  return [incompleteUser];
};
