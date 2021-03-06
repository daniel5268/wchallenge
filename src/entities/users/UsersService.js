const UsersService = module.exports;

const lodash = require('lodash');

const UsersRepository = require('./UsersRepository');
const UsersCryptoCoinsRepository = require('../usersCryptoCoins/UsersCryptoCoinsRepository');
const {
  BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError,
} = require('../../utils/Errors');
const Secrets = require('../../utils/Secrets');
const CryptoCoinsService = require('../cryptoCoins/CryptoCoinsService');
const JWT = require('../../utils/JWT');

function getUserNames(users) {
  return users.map((user) => user.username);
}

function getRepeatedUsernamesFromUsers(users) {
  const repeatedUsernames = [];
  const usersGroupedByUsername = lodash.groupBy(users, 'username');

  Object.keys(usersGroupedByUsername).forEach((username) => {
    if (usersGroupedByUsername[username].length > 1) repeatedUsernames.push(username);
  });

  return repeatedUsernames;
}

function cleanUsers(users) {
  return users.map((user) => {
    const { password, ...restUser } = user;

    return restUser;
  });
}

UsersService.createUsers = async (usersInfo) => {
  const repeatedUserNames = getRepeatedUsernamesFromUsers(usersInfo);

  if (repeatedUserNames.length) {
    throw new BadRequestError(`Username(s): [${repeatedUserNames.join(', ')}] were provided for more than one user`);
  }

  const usernames = getUserNames(usersInfo);
  const alreadyCreatedUsers = await UsersRepository.findWhereIn('username', usernames);

  if (alreadyCreatedUsers.length) {
    const alreadyCreatedUserNames = getUserNames(alreadyCreatedUsers);

    throw new BadRequestError(`Username(s): [${alreadyCreatedUserNames.join(', ')}] already exists in our records`);
  }

  const usersWithHashedPassword = await Promise.all(usersInfo.map(async (user) => {
    const { password, ...restUser } = user;
    const hashedPassword = await Secrets.hash(password);

    return { ...restUser, password: hashedPassword };
  }));

  const insertedUsers = await UsersRepository.insert(usersWithHashedPassword);

  return cleanUsers(insertedUsers);
};

UsersService.login = async (username, password) => {
  const user = await UsersRepository.findByUsername(username);

  if (!user) throw new NotFoundError(`Username ${username} not found`);

  const { password: hashedPassword, id: userId } = user;

  const isUserAuthenticated = await Secrets.compare(password, hashedPassword);

  if (!isUserAuthenticated) throw new UnauthorizedError('Credentials do not match with our records');

  const token = JWT.generateToken({ user_id: userId, username });

  return {
    token,
    expiration_time: JWT.EXPIRATION_TIME,
  };
};

UsersService.addCryptoCoins = async (loggedUserId, targetUserId, cryptoCoinIds) => {
  if (loggedUserId !== +targetUserId) throw new ForbiddenError('It\'s not allowed to add coins to another user');

  const user = await UsersRepository.findById(targetUserId);

  if (!user) throw new NotFoundError(`User with id ${targetUserId} not found`);

  const cryptoCoins = await CryptoCoinsService.createCryptoCoinsIfNeeded(cryptoCoinIds);

  const existingUsersCryptoCoins = await UsersCryptoCoinsRepository.findByUserIdAndCryptoCoins(
    targetUserId, cryptoCoins,
  );

  if (existingUsersCryptoCoins.length) {
    throw new BadRequestError('Some of the provided coins already belong to the user');
  }

  const UsersCryptoCoinsInfo = cryptoCoins.map(
    (cryptoCoin) => ({ crypto_coin_id: cryptoCoin.id, user_id: targetUserId }),
  );

  return UsersCryptoCoinsRepository.insert(UsersCryptoCoinsInfo);
};

UsersService.getTopCryptoCoins = async (loggedUserId, targetUserId, numberOfCryptoCoins, order) => {
  if (loggedUserId !== +targetUserId) throw new ForbiddenError();

  const user = await UsersRepository.findById(targetUserId);

  if (!user) throw new NotFoundError();

  const { preferred_coin: preferredCoin } = user;
  const cryptoCoinIds = await (UsersCryptoCoinsRepository.findByUserId(targetUserId).pluck('crypto_coin_id'));

  return CryptoCoinsService.getTopCryptoCoins(preferredCoin, cryptoCoinIds, numberOfCryptoCoins, order);
};
