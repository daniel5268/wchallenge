const express = require('express');

const UsersController = require('./UsersController');
const ApiKeyMiddleware = require('../../middlewares/ApiKeyMiddleware');

const UsersRouter = express.Router();

UsersRouter.post('/', ApiKeyMiddleware, UsersController.createUsers);
UsersRouter.post('/login', UsersController.login);

module.exports = UsersRouter;
