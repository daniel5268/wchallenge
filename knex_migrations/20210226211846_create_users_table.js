const { USERS } = require('../src/constants/TableNames');

exports.up = (knex) => knex.schema.createTable(USERS, (table) => {
  table.increments('id');
  table.string('name').unique().notNullable();
  table.string('last_name').notNullable();
  table.string('username').notNullable().unique();
  table.string('password').notNullable();
  table.string('preferred_coin').notNullable();
  table.timestamps(true, true);
});

exports.down = (knex) => knex.schema.dropTable(USERS);
