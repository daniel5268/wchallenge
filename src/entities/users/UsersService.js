const UsersService = module.exports;

const _ = require('lodash');

const UsersRepository = require('./UsersRepository');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../../utils/Errors');
const Secrets = require('../../utils/Secrets');
const JWT = require('../../utils/JWT');

function getUserNames(users) {
  return users.map((user) => user.username);
}

function getRepeatedUsernamesFromUsers(users) {
  const repeatedUsernames = [];
  const usersGroupedByUsername = _.groupBy(users, 'username');

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
