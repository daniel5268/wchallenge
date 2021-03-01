const Logger = module.exports;

const log4js = require('log4js');

const { LOG_LEVEL } = process.env;

const W_CHALLENGE = 'wChallenge';

Logger.initLogger = () => {
  log4js.configure({
    appenders: {
      out: {
        type: 'stdout',
      },
    },
    categories: {
      [W_CHALLENGE]: { appenders: ['out'], level: LOG_LEVEL },
      default: { appenders: ['out'], level: LOG_LEVEL },
    },
  });
};

Logger.logger = log4js.getLogger(W_CHALLENGE);
