const DBTestUtils = module.exports;

const db = require('../../src/utils/DB');
const { USERS, USERS_CRYPTO_COINS, CRYPTO_COINS } = require('../../src/constants/TableNames');

DBTestUtils.resetId = (tableName) => db.schema.raw(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`);

DBTestUtils.cleanDatabase = async () => {
  await db(USERS_CRYPTO_COINS).truncate();
  await Promise.all([
    db(USERS).delete(),
    db(CRYPTO_COINS).delete(),
    this.resetId(USERS),
    this.resetId(CRYPTO_COINS),
  ]);
};

DBTestUtils.cleanRecord = (record, removeId = true) => {
  const { created_at: createdAt, updated_at: updatedAt, ...cleanedRecord } = record;

  if (removeId) {
    delete cleanedRecord.id;
  }

  return cleanedRecord;
};

DBTestUtils.cleanRecords = (records, removeId = true) => records.map(
  (record) => DBTestUtils.cleanRecord(record, removeId),
);
