const UsersController = module.exports;

const { logger } = require('../../utils/Logger');
const Validator = require('../../utils/Validator');
const CreateUserSchema = require('./schemas/CreateUsersSchema');
const LoginSchema = require('./schemas/LoginSchema');
const AddCryptoCoinsSchema = require('./schemas/AddCryptoCoinsSchema');
const GetTopCryptoCoinsQuerySchema = require('./schemas/GetTopCryptoCoinsQuerySchema');
const UsersService = require('./UsersService');
const { statusCodes: { CREATED } } = require('../../constants/HttpConstants');

const PACKAGE_NAME = 'UsersController';

UsersController.createUsers = (req, res, next) => {
  const section = `${PACKAGE_NAME}.createUsers`;
  const { body: usersInfo } = req;
  logger.info(section, 'starts with:', usersInfo);

  Validator.validateSchema(CreateUserSchema, usersInfo);

  UsersService.createUsers(usersInfo).then((createdUsers) => {
    logger.info(section, 'ends successfully with:', createdUsers);

    return res.status(CREATED).send(createdUsers);
  }).catch((error) => {
    logger.error(section, 'ends with error', error);

    return next(error);
  });
};

UsersController.login = (req, res, next) => {
  const section = `${PACKAGE_NAME}.login`;
  const { body: loginInfo } = req;
  logger.info(section, 'starts');

  Validator.validateSchema(loginInfo, LoginSchema);

  const { username, password } = loginInfo;

  UsersService.login(username, password).then((tokenInfo) => {
    logger.info(section, 'ends successfully');

    return res.send(tokenInfo);
  }).catch((error) => {
    logger.error(section, 'ends with error', error);

    return next(error);
  });
};

UsersController.addCryptoCoins = (req, res, next) => {
  const section = `${PACKAGE_NAME}.addCryptoCoins`;
  const { body, user_id: loggedUserId, params: { userId: targetUserId } } = req;
  logger.info(section, 'starts with:', body);

  Validator.validateSchema(AddCryptoCoinsSchema, body);

  const { crypto_coin_ids: cryptoCoinIds } = body;

  UsersService.addCryptoCoins(loggedUserId, targetUserId, cryptoCoinIds).then((createdUsersCryptoCoins) => {
    logger.info(section, 'ends successfully with:', createdUsersCryptoCoins);

    return res.status(CREATED).send(createdUsersCryptoCoins);
  }).catch((error) => {
    logger.error(section, 'ends with error', error);

    return next(error);
  });
};

UsersController.getTopCryptoCoins = (req, res, next) => {
  const section = `${PACKAGE_NAME}.getTopCryptoCoins`;
  const {
    user_id: loggedUserId,
    params: { userId: targetUserId },
    query: { N: numberOfCryptoCoins = 25, order = 'desc' },
    query,
  } = req;
  logger.info(section, 'starts with N:', numberOfCryptoCoins);

  Validator.validateSchema(query, GetTopCryptoCoinsQuerySchema);

  UsersService.getTopCryptoCoins(loggedUserId, targetUserId, +numberOfCryptoCoins, order)
    .then((topCryptoCoins) => {
      logger.info(section, 'ends successfully');

      return res.send(topCryptoCoins);
    }).catch((error) => {
      logger.error(section, 'ends with error', error);

      return next(error);
    });
};
