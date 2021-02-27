require('dotenv').config();

const express = require('express');

const LoggerMiddleware = require('./middlewares/LoggerMiddleware');
const { initLogger, logger } = require('./utils/Logger');
const routes = require('./routes');

const { PORT } = process.env;

initLogger();

const app = express();

app.use(LoggerMiddleware);
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  logger.info(`wChallenge listening at :${PORT}`);
});

module.exports = app;
