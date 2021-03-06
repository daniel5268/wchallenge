const CryptoCoinsRepository = module.exports;

const DB = require('../../utils/DB');
const { CRYPTO_COINS } = require('../../constants/TableNames');

CryptoCoinsRepository.findWhereIn = (column, values) => DB(CRYPTO_COINS).whereIn(column, values);

CryptoCoinsRepository.insert = (usersInfo) => DB(CRYPTO_COINS).insert(usersInfo).returning('*');
