const express = require('express');

const Routes = express.Router();

const HealthCheckRouter = require('./entities/healthCheck/HealthCheckController');

Routes.get('/health-check', HealthCheckRouter.healthCheck);

module.exports = Routes;
