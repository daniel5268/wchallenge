const knex = require('knex');

const { databaseConfig } = require('../config/DataBaseConfig');

const DB = knex(databaseConfig);

module.exports = DB;
