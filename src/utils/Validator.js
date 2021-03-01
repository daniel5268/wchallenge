const Ajv = require('ajv');

const { logger } = require('./Logger');
const { BadRequestError } = require('./Errors');

const Validator = module.exports;

Validator.validateSchema = (schema, data) => {
  const section = 'Validator.validateSchema';
  const ajv = new Ajv();
  const compiler = ajv.compile(schema);

  const isValid = compiler(data);

  if (!isValid) {
    const validationError = compiler.errors[0];
    const { message, dataPath } = validationError;
    const errorMessage = `${dataPath.replace('.', '')} ${message.replace('.', '')}`;
    logger.error(section, errorMessage);

    throw new BadRequestError(errorMessage);
  }
};
