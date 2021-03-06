const { CRYPTO_COINS } = require('../src/constants/TableNames');

exports.up = (knex) => knex.schema.createTable(CRYPTO_COINS, (table) => {
  table.increments('id');
  table.string('external_id').unique().notNullable();
  table.timestamps(true, true);
});

exports.down = (knex) => knex.schema.dropTable(CRYPTO_COINS);
