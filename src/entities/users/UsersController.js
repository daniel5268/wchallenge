const UsersController = module.exports;

const { logger } = require('../../utils/Logger');
const Validator = require('../../utils/Validator');
const CreateUserSchema = require('./schemas/CreateUsersSchema');
const LoginSchema = require('./schemas/LoginSchema');
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
