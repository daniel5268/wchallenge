const UsersCryptoCoinsRepository = module.exports;

const DB = require('../../utils/DB');
const { USERS_CRYPTO_COINS } = require('../../constants/TableNames');

UsersCryptoCoinsRepository.insert = (usersCryptoCoinsInfo) => DB(USERS_CRYPTO_COINS)
  .insert(usersCryptoCoinsInfo)
  .returning('*');

UsersCryptoCoinsRepository.findByUserIdAndCryptoCoins = (userId, cryptoCoins) => {
  const cryptoCoinIds = cryptoCoins.map(({ id }) => id);

  return DB(USERS_CRYPTO_COINS).where({ user_id: userId }).whereIn('crypto_coin_id', cryptoCoinIds);
};

UsersCryptoCoinsRepository.findByUserId = (userId) => DB(USERS_CRYPTO_COINS).where({ user_id: userId });
