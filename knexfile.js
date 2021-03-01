const { databaseConfig } = require('./src/config/DataBaseConfig');

module.exports = {
  ...databaseConfig,
  migrations: {
    directory: './knex_migrations',
  },
};
