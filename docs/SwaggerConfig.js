const SwaggerParameters = require('./SwaggerParameters');
const SwaggerTags = require('./SwaggerTags');
const SwaggerRequestBodies = require('./SwaggerRequestBodies');
const SwaggerResponses = require('./SwaggerResponses');

const { version } = require('../package.json');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'wChallenge',
    version,
    description: 'Wrapper for the https://www.coingecko.com/en/api API',
  },
  servers: [{
    url: 'http://localhost:3000',
  }],
  apis: [
    './src/entities/**/*Controller.js',
  ],
  components: {
    parameters: SwaggerParameters,
    requestBodies: SwaggerRequestBodies,
    responses: SwaggerResponses,
  },
  tags: SwaggerTags,
};
