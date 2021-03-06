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

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     description: This method is used to create users
 *     parameters:
 *       - $ref: '#/components/parameters/apiKey'
 *     requestBody:
 *       $ref: '#/components/requestBodies/createUsers'
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/createdUsers'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
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

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Users
 *     description: This method is obtain the token required to consume this API endpoint
 *     requestBody:
 *       $ref: '#/components/requestBodies/login'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/tokenInfo'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
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

/**
 * @swagger
 * /users/{userId}/crypto-coins:
 *   post:
 *     tags:
 *       - Users
 *     description: This endpoint is used to add a crypto coins to a user
 *     parameters:
 *       - $ref: '#/components/parameters/token'
 *       - $ref: '#/components/parameters/pathUserId'
 *     requestBody:
 *       $ref: '#/components/requestBodies/addCryptoCoin'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/createdUsersCryptoCoins'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
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

/**
 * @swagger
 * /users/{userId}/crypto-coins/top:
 *   get:
 *     tags:
 *       - Users
 *     description: This endpoint is used to get the information about the most relevant crypto coins for the user
 *     parameters:
 *       - $ref: '#/components/parameters/token'
 *       - $ref: '#/components/parameters/pathUserId'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/topUsersCryptoCoins'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
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
