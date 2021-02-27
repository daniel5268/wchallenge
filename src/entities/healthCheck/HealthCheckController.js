const HealthCheckControllers = module.exports;

HealthCheckControllers.healthCheck = (req, res) => {
  const { logger } = req;
  const section = 'HealthCheckControllers.healthCheck';
  logger.debug(section, 'starts');

  res.send({ service_status: 'ok' });
};
