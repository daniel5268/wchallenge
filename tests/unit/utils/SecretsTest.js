const { assert } = require('chai');
const Secrets = require('../../../src/utils/Secrets');

describe('Secrets test', () => {
  const testString = 'testing';

  it('Should return true when the hash matches', async () => {
    const hashedString = await Secrets.hash(testString);
    const result = await Secrets.compare(testString, hashedString);

    assert.strictEqual(result, true);
  });

  it('Should return false when the hash does not match', async () => {
    const result = await Secrets.compare(testString, 'invalidHash');

    assert.strictEqual(result, false);
  });
});
