const axios = require('axios');

const CryptoCoinsResource = module.exports;

const { BadGatewayError } = require('../../utils/Errors');
const { logger } = require('../../utils/Logger');

const PACKAGE_NAME = 'CryptoCoinsResource';
const BASE_URL = 'https://api.coingecko.com/api/v3';
const DEFAULT_CURRENCY = 'USD';
const headers = {
  accept: 'application/json',
};

function mapGeckoResponse(response) {
  const { data } = response;

  return data.map((coinInfo) => {
    const {
      id, symbol, current_price: currentPrice, name, image, last_updated: lastUpdated,
    } = coinInfo;

    return {
      id, symbol, price: currentPrice, name, image, last_updated: lastUpdated,
    };
  });
}

CryptoCoinsResource.getCryptoCoinsInfo = async (currency, page = 1, perPage = 50) => {
  const url = `${BASE_URL}/coins/markets`;
  const params = { vs_currency: currency, page, per_page: perPage };
  const section = `${PACKAGE_NAME}.getCryptoCoinsInfo`;

  logger.debug(section, 'starts with', { currency, page, perPage });

  const response = await axios.get(url, { headers, params }).catch((error) => {
    logger.error(section, error);

    throw new BadGatewayError();
  });

  return mapGeckoResponse(response);
};

CryptoCoinsResource.getCryptoCoinsInfoByIds = async (ids, currency = DEFAULT_CURRENCY) => {
  const url = `${BASE_URL}/coins/markets`;
  const params = { vs_currency: currency, ids: ids.join(',') };
  const section = `${PACKAGE_NAME}.getCryptoCoinsInfoByIds`;

  logger.debug(section, 'starts with', ids);

  const response = await axios.get(url, { headers, params }).catch((error) => {
    logger.error(section, error);

    throw new BadGatewayError();
  });

  return mapGeckoResponse(response);
};

CryptoCoinsResource.getCryptoCoinsInfoByIdsWithCurrency = async (ids, currency) => {
  const cryptoCoinInfo = await this.getCryptoCoinsInfoByIds(ids, currency);

  return { info: cryptoCoinInfo, currency };
};
