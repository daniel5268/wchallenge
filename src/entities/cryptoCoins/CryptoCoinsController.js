const CryptoCoinsController = module.exports;

const CryptoCoinsService = require('./CryptoCoinsService');
const { logger } = require('../../utils/Logger');
const { paginationSchema } = require('../../utils/Schemas');
const Validator = require('../../utils/Validator');

const PACKAGE_NAME = 'CryptoCoinsController';

/**
 * @swagger
 * /crypto-coins:
 *   get:
 *     tags:
 *       - Crypto coins
 *     description: This endpoint is used to get the information about the existing crypto coins
 *     parameters:
 *       - $ref: '#/components/parameters/token'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/perPage'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/cryptoCoins'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
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
