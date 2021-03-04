const JWT = require('../utils/JWT');

const { UnauthorizedError } = require('../utils/Errors');
const { logger } = require('../utils/Logger');

module.exports = (req, _, next) => {
  const section = 'JWTMiddleware';

  try {
    const token = req.header('TOKEN');

    if (!token) throw new UnauthorizedError('TOKEN must be provided');

    const { user_id: userId, username } = JWT.verify(token);
    req.user_id = userId;
    req.username = username;

    return next();
  } catch (error) {
    logger.error(section, 'An error ocurred trying to verify the token:', error);

    throw new UnauthorizedError();
  }
};
