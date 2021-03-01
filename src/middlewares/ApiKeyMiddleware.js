const { API_KEY } = process.env;

const { UnauthorizedError } = require('../utils/Errors');

module.exports = (req, _, next) => {
  const apiKey = req.header('API_KEY');

  if (apiKey !== API_KEY) return next(new UnauthorizedError());

  return next();
};
