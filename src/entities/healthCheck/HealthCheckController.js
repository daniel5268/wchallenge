const HealthCheckControllers = module.exports;

const { logger } = require('../../utils/Logger');

HealthCheckControllers.healthCheck = (req, res) => {
  const section = 'HealthCheckControllers.healthCheck';
  logger.debug(section, 'starts');

  res.send({ service_status: 'ok' });
};
