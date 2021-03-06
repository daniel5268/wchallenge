const CryptoCoinsService = module.exports;

const lodash = require('lodash');

const UsersRepository = require('../users/UsersRepository');
const { NotFoundError, BadRequestError } = require('../../utils/Errors');
const CryptoCoinsResource = require('./CryptoCoinsResource');
const CryptoCoinsRepository = require('./CryptoCoinsRepository');
const { ALLOWED_PREFERRED_COINS: { USD, ARS, EUR } } = require('../users/UsersConstants');

CryptoCoinsService.getCryptoCoinsInfo = async (username, page, perPage) => {
  if (page < 0 || perPage < 0) throw new BadRequestError();

  const user = await UsersRepository.findByUsername(username);

  if (!user) throw new NotFoundError(`Username ${username} not found`);

  const { preferred_coin: preferredCoin } = user;

  return CryptoCoinsResource.getCryptoCoinsInfo(preferredCoin, page, perPage);
};

CryptoCoinsService.createCryptoCoinsIfNeeded = async (cryptoCoinsIds) => {
  const existingCryptoCoinsInDB = await CryptoCoinsRepository.findWhereIn('external_id', cryptoCoinsIds);
  const existingCryptoCoinsInDBIds = existingCryptoCoinsInDB.map(({ external_id: externalId }) => externalId);

  const notExistingCryptoCoinsInDBIds = lodash.difference(cryptoCoinsIds, existingCryptoCoinsInDBIds);

  const shouldInsertCryptoCoins = notExistingCryptoCoinsInDBIds.length;

  if (!shouldInsertCryptoCoins) return existingCryptoCoinsInDB;

  const existingCryptoCoinsInResource = await CryptoCoinsResource.getCryptoCoinsInfoByIds(
    notExistingCryptoCoinsInDBIds,
  );

  if (notExistingCryptoCoinsInDBIds.length !== existingCryptoCoinsInResource.length) {
    throw new NotFoundError('Some of the provided coins do not exist in the resource');
  }

  const newCryptoCoinsInfo = notExistingCryptoCoinsInDBIds.map(
    (cryptoCoinExternalId) => ({ external_id: cryptoCoinExternalId }),
  );

  const newCryptoCoins = await CryptoCoinsRepository.insert(newCryptoCoinsInfo);

  return [...existingCryptoCoinsInDB, ...newCryptoCoins];
};

CryptoCoinsService.getTopCryptoCoins = async (preferredCoin, cryptoCoinIds, numberOfCryptoCoins, order) => {
  if (!cryptoCoinIds.length) return [];

  const cryptoCoins = await CryptoCoinsRepository.findWhereIn('id', cryptoCoinIds);
  const externalIds = cryptoCoins.map(({ external_id: externalId }) => externalId);

  const cryptoCoinsInfoAndCurrencyList = await Promise.all([
    CryptoCoinsResource.getCryptoCoinsInfoByIdsWithCurrency(externalIds, ARS),
    CryptoCoinsResource.getCryptoCoinsInfoByIdsWithCurrency(externalIds, EUR),
    CryptoCoinsResource.getCryptoCoinsInfoByIdsWithCurrency(externalIds, USD),
  ]);

  const { info: preferredCurrencyCryptoCoinsInfo } = cryptoCoinsInfoAndCurrencyList.find(
    ({ currency }) => currency === preferredCoin,
  );

  const topPreferredCurrencyCryptoCoinsInfo = preferredCurrencyCryptoCoinsInfo.sort(
    (cryptoCoinInfo1, cryptoCoinInfo2) => {
      const { price: currentPrice1 } = cryptoCoinInfo1;
      const { price: currentPrice2 } = cryptoCoinInfo2;

      return currentPrice1 <= currentPrice2 ? 1 : -1;
    },
  ).slice(0, numberOfCryptoCoins);

  const topPreferredCurrencyCryptoCoinsInfoWithPrices = topPreferredCurrencyCryptoCoinsInfo.map(
    (topPreferredCurrencyCryptoCoinInfo) => {
      const {
        id, symbol, name, image, last_updated: lastUpdated,
      } = topPreferredCurrencyCryptoCoinInfo;

      const { info: arsCoinsInfo } = cryptoCoinsInfoAndCurrencyList.find(({ currency }) => currency === ARS);
      const { info: eurCoinsInfo } = cryptoCoinsInfoAndCurrencyList.find(({ currency }) => currency === EUR);
      const { info: usdCoinsInfo } = cryptoCoinsInfoAndCurrencyList.find(({ currency }) => currency === USD);

      const { price: arsPrice } = arsCoinsInfo.find(({ name: arsCoinName }) => arsCoinName === name);
      const { price: eurPrice } = eurCoinsInfo.find(({ name: eurCoinName }) => eurCoinName === name);
      const { price: usdPrice } = usdCoinsInfo.find(({ name: usdCoinName }) => usdCoinName === name);

      return {
        id,
        symbol,
        name,
        image,
        last_updated: lastUpdated,
        ars_price: arsPrice,
        eur_price: eurPrice,
        usd_price: usdPrice,
      };
    },
  );

  if (order === 'asc') topPreferredCurrencyCryptoCoinsInfoWithPrices.reverse();

  return topPreferredCurrencyCryptoCoinsInfoWithPrices;
};
