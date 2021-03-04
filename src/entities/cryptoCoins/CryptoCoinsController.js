const CryptoCoinsController = module.exports;

const CryptoCoinsService = require('./CryptoCoinsService');
const { logger } = require('../../utils/Logger');
const { paginationSchema } = require('../../utils/Schemas');
const Validator = require('../../utils/Validator');

const PACKAGE_NAME = 'CryptoCoinsController';

CryptoCoinsController.getCryptoCoinsInfo = (req, res, next) => {
  const section = `${PACKAGE_NAME}.getCryptoCoinsInfo`;
  logger.info(section, 'starts');
  const { query, query: { page, per_page: perPage }, username } = req;

  Validator.validateSchema(paginationSchema, query);

  CryptoCoinsService.getCryptoCoinsInfo(username, +page, +perPage).then((cryptoCoinsInfo) => {
    logger.info(section, 'ends successfully');

    return res.send(cryptoCoinsInfo);
  }).catch((error) => {
    logger.error(section, 'ends with error', error);

    return next(error);
  });
};
