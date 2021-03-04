const axios = require('axios');

const CryptoCoinsResource = module.exports;

const { BadGatewayError } = require('../../utils/Errors');
const { logger } = require('../../utils/Logger');

const PACKAGE_NAME = 'CryptoCoinsResource';
const BASE_URL = 'https://api.coingecko.com/api/v3';
const headers = {
  accept: 'application/json',
};

CryptoCoinsResource.getCoinsInfo = async (currency, page = 1, perPage = 50) => {
  const url = `${BASE_URL}/coins/markets`;
  const query = { vs_currency: currency, page, perPage };
  const section = `${PACKAGE_NAME}.getCoinsInfo`;

  logger.debug(section, 'starts with', { currency, page, perPage });

  const { data } = await axios.get(url, { headers, query }).catch((error) => {
    logger.error(section, error);

    throw new BadGatewayError();
  });

  return data.map((coinInfo) => {
    const {
      id, symbol, current_price: currentPrice, name, image, last_updated: lastUpdated,
    } = coinInfo;

    return {
      id, symbol, price: currentPrice, name, image, last_updated: lastUpdated,
    };
  });
};
