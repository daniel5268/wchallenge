require('dotenv').config();

const assert = require('assert');

const {
  DB_PORT, DB_HOST, DB_NAME, DB_USER, DB_SECRET,
} = process.env;

assert(DB_PORT, 'DB_PORT not provided');
assert(DB_HOST, 'DB_HOST not provided');
assert(DB_NAME, 'DB_NAME not provided');
assert(DB_USER, 'DB_USER not provided');
assert(DB_SECRET, 'DB_SECRET not provided');

module.exports = {
  databaseConfig: {
    connection: `postgres://${DB_USER}:${DB_SECRET}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    client: 'pg',
  },
};
