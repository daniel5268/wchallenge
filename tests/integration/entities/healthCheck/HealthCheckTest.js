const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { statusCodes: { SUCCESS } } = require('../../../../src/constants/HttpConstants');
const app = require('../../../../src/index');

chai.use(chaiHttp);

describe('Health check integration test', () => {
  let status;
  let body;
  const HEALTH_CHECK_PATH = '/health-check';
  before(async () => {
    ({ status, body } = await chai.request(app).get(HEALTH_CHECK_PATH));
  });

  it('Should return a success status', () => {
    assert.strictEqual(status, SUCCESS);
  });

  it('Should return service_status ok', () => {
    assert.deepStrictEqual(body, { service_status: 'ok' });
  });
});
