const { statusCodes: { INTERNAL_ERROR } } = require('../constants/HttpConstants');

function isCode5xx(code) {
  const result = Math.floor(code / 100) === 5;

  return result;
}

// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
  const { status = INTERNAL_ERROR, message: errorMessage } = error;

  const responseMessage = isCode5xx(status) ? 'Internal error, please contact administrator' : errorMessage;

  return res.status(status).send({ error: { message: responseMessage } });
};
