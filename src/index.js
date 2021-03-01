require('dotenv').config();

const express = require('express');

const ErrorsHandlerMiddleware = require('./middlewares/ErrorsHandlerMiddleware');
const { initLogger, logger } = require('./utils/Logger');
const routes = require('./routes');

const { PORT } = process.env;

initLogger();

const app = express();

app.use(express.json());
app.use(routes);
app.use(ErrorsHandlerMiddleware);

app.listen(PORT, () => {
  logger.info(`wChallenge listening at :${PORT}`);
});

module.exports = app;
