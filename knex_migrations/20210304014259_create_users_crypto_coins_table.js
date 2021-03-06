const { CRYPTO_COINS, USERS, USERS_CRYPTO_COINS } = require('../src/constants/TableNames');

exports.up = (knex) => knex.schema.createTable(USERS_CRYPTO_COINS, (table) => {
  table.increments('id');
  table.integer('user_id')
    .notNullable()
    .references('id').inTable(USERS)
    .onDelete('CASCADE');

  table.integer('crypto_coin_id')
    .notNullable()
    .references('id').inTable(CRYPTO_COINS)
    .onDelete('CASCADE');

  table.unique(['user_id', 'crypto_coin_id']);
  table.timestamps(true, true);
});

exports.down = (knex) => knex.schema.dropTable(USERS_CRYPTO_COINS);
