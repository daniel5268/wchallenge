const express = require('express');

const Routes = express.Router();

const HealthCheckRouter = require('./entities/healthCheck/HealthCheckController');
const UsersRouter = require('./entities/users/UsersRouter');

Routes.get('/health-check', HealthCheckRouter.healthCheck);
Routes.use('/users', UsersRouter);

module.exports = Routes;
