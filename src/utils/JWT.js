const JWT = module.exports;

const jsonwebtoken = require('jsonwebtoken');

const { TOKEN_ISSUER, TOKEN_EXPIRATION_TIME, TOKEN_PRIVATE_KEY } = process.env;

const HOURS_TO_SECS = 3600;

JWT.EXPIRATION_TIME = TOKEN_EXPIRATION_TIME * HOURS_TO_SECS;

JWT.generateToken = (payload) => {
  const signOptions = {
    issuer: TOKEN_ISSUER,
    expiresIn: `${TOKEN_EXPIRATION_TIME}h`,
    algorithm: 'HS256',
  };

  return jsonwebtoken.sign(payload, TOKEN_PRIVATE_KEY, signOptions);
};

JWT.verify = (token) => {
  const verifyOptions = {
    issuer: TOKEN_ISSUER,
    expiresIn: `${TOKEN_EXPIRATION_TIME}h`,
  };

  return jsonwebtoken.verify(token, TOKEN_PRIVATE_KEY, verifyOptions);
};
