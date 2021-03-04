const CryptoCoinsService = module.exports;

const UsersRepository = require('../users/UsersRepository');
const { NotFoundError, BadRequestError } = require('../../utils/Errors');
const CryptoCoinsResource = require('./CryptoCoinsResource');

CryptoCoinsService.getCryptoCoinsInfo = async (username, page, perPage) => {
  if (page < 0 || perPage < 0) throw new BadRequestError();

  const user = await UsersRepository.findByUsername(username);

  if (!user) throw new NotFoundError(`Username ${username} not found`);

  const { preferred_coin: preferredCoin } = user;

  return CryptoCoinsResource.getCoinsInfo(preferredCoin, page, perPage);
};
