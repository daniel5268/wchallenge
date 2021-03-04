const express = require('express');

const CryptoCoinsController = require('./CryptoCoinsController');
const JWTMiddleware = require('../../middlewares/JWTMiddleware');

const CryptoCoinsRouter = express.Router();

CryptoCoinsRouter.get('/', JWTMiddleware, CryptoCoinsController.getCryptoCoinsInfo);

module.exports = CryptoCoinsRouter;
