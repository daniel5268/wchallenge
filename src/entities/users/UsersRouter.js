const express = require('express');

const UsersController = require('./UsersController');
const ApiKeyMiddleware = require('../../middlewares/ApiKeyMiddleware');
const JWTMiddleware = require('../../middlewares/JWTMiddleware');

const UsersRouter = express.Router();

UsersRouter.post('/', ApiKeyMiddleware, UsersController.createUsers);
UsersRouter.post('/login', UsersController.login);
UsersRouter.post('/:userId(\\d+)/crypto-coins', JWTMiddleware, UsersController.addCryptoCoins);
UsersRouter.get('/:userId(\\d+)/crypto-coins/top', JWTMiddleware, UsersController.getTopCryptoCoins);

module.exports = UsersRouter;
