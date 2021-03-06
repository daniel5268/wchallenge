const HealthCheckControllers = module.exports;

const { logger } = require('../../utils/Logger');

/**
 * @swagger
 * /health-check:
 *   get:
 *     tags:
 *       - Service status
 *     description: This endpoint is used check if the server is on
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/healthCheck'
 *       'default':
 *         $ref: '#/components/responses/error'
 */
HealthCheckControllers.healthCheck = (req, res) => {
  const section = 'HealthCheckControllers.healthCheck';
  logger.debug(section, 'starts');

  res.send({ service_status: 'ok' });
};
