const Secrets = module.exports;

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 5;

Secrets.hash = (password) => bcrypt.hash(password, SALT_ROUNDS);
Secrets.compare = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);
