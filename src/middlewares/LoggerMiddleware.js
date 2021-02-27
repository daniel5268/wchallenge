const { logger } = require('../utils/Logger');

module.exports = (req, res, next) => {
  req.logger = logger;

  return next();
};
