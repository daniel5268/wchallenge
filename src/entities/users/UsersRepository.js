const UsersRepository = module.exports;

const DB = require('../../utils/DB');
const { USERS } = require('../../constants/TableNames');

UsersRepository.insert = (usersInfo) => DB(USERS).insert(usersInfo).returning('*');

UsersRepository.findWhereIn = (column, values) => DB(USERS).whereIn(column, values);

UsersRepository.findByUsername = (username) => DB(USERS).where({ username }).first();
