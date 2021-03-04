const express = require('express');

const Routes = express.Router();

const HealthCheckRouter = require('./entities/healthCheck/HealthCheckController');
const UsersRouter = require('./entities/users/UsersRouter');
const CryptoCoinsRouter = require('./entities/cryptoCoins/CryptoCoinsRouter');

Routes.get('/health-check', HealthCheckRouter.healthCheck);
Routes.use('/users', UsersRouter);
Routes.use('/crypto-coins', CryptoCoinsRouter);

module.exports = Routes;
