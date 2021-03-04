/* eslint-disable max-classes-per-file */

const Errors = module.exports;

const {
  statusCodes: {
    BAD_REQUEST, UNAUTHORIZED, NOT_FOUND, BAD_GATEWAY,
  },
} = require('../constants/HttpConstants');

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message);
    this.status = BAD_REQUEST;
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.status = UNAUTHORIZED;
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message);
    this.status = NOT_FOUND;
  }
}

class BadGatewayError extends HttpError {
  constructor(message = 'Bad gateway') {
    super(message);
    this.status = BAD_GATEWAY;
  }
}

Errors.BadRequestError = BadRequestError;

Errors.UnauthorizedError = UnauthorizedError;

Errors.NotFoundError = NotFoundError;

Errors.BadGatewayError = BadGatewayError;
