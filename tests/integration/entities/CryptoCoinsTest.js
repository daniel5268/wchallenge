const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sandbox = require('sinon').createSandbox();
const axios = require('axios');

const app = require('../../../src/index');
const {
  statusCodes: {
    OK, BAD_REQUEST, UNAUTHORIZED, BAD_GATEWAY, NOT_FOUND,
  },
} = require('../../../src/constants/HttpConstants');
const CryptoCoinsData = require('../../data/CryptoCoinsTestData');
const UsersTestData = require('../../data/UsersTestData');

chai.use(chaiHttp);

const CRYPTO_COINS_PATH = '/crypto-coins';

describe('Crypto coins integration test', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('Gets available crypto coins', () => {
    describe('Should work correctly', () => {
      let body;
      let status;

      beforeEach(async () => {
        sandbox.stub(axios, 'get').resolves(CryptoCoinsData.geckoCoinsInfo);
        ({ body, status } = await chai.request(app).get(CRYPTO_COINS_PATH).set('TOKEN', UsersTestData.token));
      });

      it('Should return an Ok status', () => {
        assert.strictEqual(status, OK);
      });

      it('Should return only the expected properties', () => {
        assert.deepStrictEqual(body, CryptoCoinsData.expectedCoinsInfo);
      });
    });

    describe('Should fail correctly', () => {
      it('Should throw an error when an invalid token is provided', async () => {
        const { body: { error: { message } }, status } = await chai.request(app)
          .get(CRYPTO_COINS_PATH)
          .set('TOKEN', 'invalid token');

        assert.strictEqual(status, UNAUTHORIZED);
        assert.strictEqual(message, 'Unauthorized');
      });

      it('Should throw an error when the pagination parameter are below 0', async () => {
        const { body: { error: { message } }, status } = await chai.request(app)
          .get(CRYPTO_COINS_PATH)
          .set('TOKEN', UsersTestData.token)
          .query({ page: '-1' });

        assert.strictEqual(status, BAD_REQUEST);
        assert.strictEqual(message, 'Bad request');
      });

      it('Should throw an error when the coins resource fails', async () => {
        sandbox.stub(axios, 'get').rejects();

        const { body: { error: { message } }, status } = await chai.request(app)
          .get(CRYPTO_COINS_PATH)
          .set('TOKEN', UsersTestData.token);

        assert.strictEqual(status, BAD_GATEWAY);
        assert.strictEqual(message, 'Internal error, please contact administrator');
      });

      it('Should throw an error if the token user does not exist', async () => {
        const { body: { error: { message } }, status } = await chai.request(app)
          .get(CRYPTO_COINS_PATH)
          .set('TOKEN', UsersTestData.invalidUserToken);

        assert.strictEqual(status, NOT_FOUND);
        assert.strictEqual(message, 'Username wat not found');
      });
    });
  });
});
