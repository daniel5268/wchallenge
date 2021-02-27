const Logger = require('../../../src/utils/Logger');

describe('Logger test', () => {
  let logger;
  const testString = 'test';
  before(() => {
    Logger.initLogger();
    ({ logger } = Logger);
  });

  it('Should have info method', () => {
    logger.info(testString);
  });

  it('Should have debug method', () => {
    logger.debug(testString);
  });

  it('Should have warn method', () => {
    logger.warn(testString);
  });

  it('Should have error method', () => {
    logger.error(testString);
  });
});
