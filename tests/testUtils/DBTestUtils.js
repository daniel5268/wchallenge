const DBTestUtils = module.exports;

const db = require('../../src/utils/DB');
const { USERS } = require('../../src/constants/TableNames');

DBTestUtils.truncateTable = (tableName) => db(tableName).truncate();

DBTestUtils.cleanDatabase = async () => {
  await Promise.all([
    this.truncateTable(USERS),
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
