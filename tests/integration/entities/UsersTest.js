const chai = require('chai');
const chaiHttp = require('chai-http');
const axios = require('axios');
const sandbox = require('sinon').createSandbox();

const { assert } = chai;

const app = require('../../../src/index');
const {
  statusCodes: {
    CREATED, OK, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND, INTERNAL_ERROR, FORBIDDEN, BAD_GATEWAY,
  },
} = require('../../../src/constants/HttpConstants');
const UsersTestData = require('../../data/UsersTestData');
const CryptoCoinsTestData = require('../../data/CryptoCoinsTestData');
const UsersRepository = require('../../../src/entities/users/UsersRepository');
const CryptoCoinsRepository = require('../../../src/entities/cryptoCoins/CryptoCoinsRepository');
const UsersCryptoCoinsRepository = require('../../../src/entities/usersCryptoCoins/UsersCryptoCoinsRepository');
const CryptoCoinsResource = require('../../../src/entities/cryptoCoins/CryptoCoinsResource');
const Secrets = require('../../../src/utils/Secrets');
const JWT = require('../../../src/utils/JWT');
const DBTestUtils = require('../../testUtils/DBTestUtils');

const { API_KEY } = process.env;
chai.use(chaiHttp);

const USERS_PATH = '/users';
const LOGIN_PATH = `${USERS_PATH}/login`;

describe('Users integration tests', () => {
  let responseStatus;
  let responseBody;
  let userId;

  beforeEach(async () => {
    await DBTestUtils.cleanDatabase();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Creates users', () => {
    describe('Should work correctly', async () => {
      beforeEach(async () => {
        ({ status: responseStatus, body: responseBody } = await chai.request(app)
          .post(USERS_PATH)
          .set('API_KEY', API_KEY)
          .send(UsersTestData.successfulCreateUsersBody));
      });

      it('Should return a CREATED status', () => {
        assert.strictEqual(responseStatus, CREATED);
      });

      it('Should return the inserted users cleaned info', () => {
        const cleanedUsersInfo = responseBody.map((user) => DBTestUtils.cleanRecord(user));
        assert.deepStrictEqual(cleanedUsersInfo, UsersTestData.expectedCreateUsersResponseBody);
      });
    });

    describe('Should throw appropriate errors when its required', () => {
      it('Should throw an error when a required property is not provided', async () => {
        const REQUIRED_PROPERTIES = ['name', 'last_name', 'username', 'password', 'preferred_coin'];

        await Promise.all(REQUIRED_PROPERTIES.map(async (requiredProperty) => {
          const incompleteBody = UsersTestData.getCreateUserBodyWithoutRequiredProperty(requiredProperty);

          const { status, body: { error: { message } } } = await chai.request(app)
            .post(USERS_PATH)
            .set('API_KEY', API_KEY)
            .send(incompleteBody);

          assert.strictEqual(status, BAD_REQUEST);
          assert.strictEqual(message, `[0] should have required property '${requiredProperty}'`);
        }));
      });

      it('Should throw an error when a username is provided for several users', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(USERS_PATH)
          .set('API_KEY', API_KEY)
          .send(UsersTestData.duplicateUsernameCreateUsersBody);

        assert.strictEqual(status, BAD_REQUEST);
        assert.strictEqual(
          message, `Username(s): [${UsersTestData.repeatedUsername}] were provided for more than one user`,
        );
      });

      it('Should throw an error when a provided username is already taken', async () => {
        await UsersRepository.insert(UsersTestData.successfulCreateUsersBody);

        const { status, body: { error: { message } } } = await chai.request(app)
          .post(USERS_PATH)
          .set('API_KEY', API_KEY)
          .send(UsersTestData.successfulCreateUsersBody);

        assert.strictEqual(status, BAD_REQUEST);
        assert.strictEqual(
          message, `Username(s): [${UsersTestData.usernames.join(', ')}] already exists in our records`,
        );
      });

      it('Should throw an error if an invalid api_key is provided', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(USERS_PATH)
          .send(UsersTestData.successfulCreateUsersBody);

        assert.strictEqual(status, UNAUTHORIZED);
        assert.strictEqual(message, 'Unauthorized');
      });

      it('Should format 5xx errors and hide the original error from response', async () => {
        sandbox.stub(UsersRepository, 'insert').rejects();

        const { status, body: { error: { message } } } = await chai.request(app)
          .post(USERS_PATH)
          .set('API_KEY', API_KEY)
          .send(UsersTestData.successfulCreateUsersBody);

        assert.strictEqual(status, INTERNAL_ERROR);
        assert.strictEqual(
          message, 'Internal error, please contact administrator',
        );
      });
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      const password = await Secrets.hash(UsersTestData.user.password);
      await UsersRepository.insert([{ ...UsersTestData.user, password }]);
    });

    describe('Should work correctly', () => {
      beforeEach(async () => {
        ({ status: responseStatus, body: responseBody } = await chai.request(app)
          .post(LOGIN_PATH)
          .send(UsersTestData.successfulLoginBody));
      });

      it('Should return an OK status', () => {
        assert.strictEqual(responseStatus, OK);
      });

      it('Should return the correct expiration time', () => {
        const { expiration_time: expirationTime } = responseBody;

        assert.strictEqual(expirationTime, JWT.EXPIRATION_TIME);
      });

      it('Should return a valid token', () => {
        const { token } = responseBody;

        const verifiedToken = JWT.verify(token);

        const {
          exp, iat, iss, ...cleanedVerifiedToken
        } = verifiedToken;

        assert.deepStrictEqual(cleanedVerifiedToken, UsersTestData.expectedVerifiedToken);
      });
    });

    describe('Should throw appropriate errors when its required', () => {
      it('Should throw an error when the user is not found', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(LOGIN_PATH)
          .send({ ...UsersTestData.successfulLoginBody, username: 'NN' });

        assert.strictEqual(status, NOT_FOUND);
        assert.strictEqual(
          message, 'Username NN not found',
        );
      });

      it('Should throw an error when the password does not match', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(LOGIN_PATH)
          .send({ ...UsersTestData.successfulLoginBody, password: 'wrong' });

        assert.strictEqual(status, UNAUTHORIZED);
        assert.strictEqual(message, 'Credentials do not match with our records');
      });
    });
  });

  describe('Adds crypto coins to user', () => {
    beforeEach(async () => {
      sandbox.spy(CryptoCoinsResource, 'getCryptoCoinsInfoByIds');
      ([{ id: userId }] = await UsersRepository.insert([UsersTestData.user]));
    });

    describe('Should work correctly when the crypto coins are already in DB', async () => {
      beforeEach(async () => {
        await CryptoCoinsRepository.insert(CryptoCoinsTestData.cryptoCoins);

        ({ body: responseBody, status: responseStatus } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody)
        );
      });

      it('Should return a created status', () => {
        assert.strictEqual(responseStatus, CREATED);
      });

      it('Should return the inserted users_crypto_coins', () => {
        const cleanedUsersCryptoCoins = DBTestUtils.cleanRecords(responseBody);

        assert.includeDeepMembers(cleanedUsersCryptoCoins, UsersTestData.expectedCreatedUsersCryptoCoins);
      });

      it('Should not call the crypto coins resource', () => {
        assert(CryptoCoinsResource.getCryptoCoinsInfoByIds.notCalled);
      });
    });

    describe('Should work correctly when the crypto coins are not in DB but are found in the resource', async () => {
      beforeEach(async () => {
        sandbox.stub(axios, 'get').resolves(CryptoCoinsTestData.geckoCoinsInfoById);

        ({ body: responseBody, status: responseStatus } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody)
        );
      });

      it('Should return a created status', () => {
        assert.strictEqual(responseStatus, CREATED);
      });

      it('Should return the inserted users_crypto_coins', () => {
        const cleanedUsersCryptoCoins = DBTestUtils.cleanRecords(responseBody);

        assert.includeDeepMembers(cleanedUsersCryptoCoins, UsersTestData.expectedCreatedUsersCryptoCoins);
      });

      it('Should call the crypto coins resource with the expected params', () => {
        assert(CryptoCoinsResource.getCryptoCoinsInfoByIds.calledOnce);
        const [externalIds] = CryptoCoinsResource.getCryptoCoinsInfoByIds.getCall(0).args;

        const { crypto_coin_ids: expectedExternalIds } = UsersTestData.successfulAddCryptoCoinsBody;

        assert.deepStrictEqual(externalIds, expectedExternalIds);
      });
    });

    describe('Should fail correctly', () => {
      it('Should throw an error when the crypto coins are not found in DB nor the resource', async () => {
        sandbox.stub(axios, 'get').resolves({ data: [] });

        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, NOT_FOUND);
        assert.strictEqual(message, 'Some of the provided coins do not exist in the resource');
      });

      it('Should throw an error if some users_crypto_coins are already created', async () => {
        const [{ id: cryptoCoinId }] = await CryptoCoinsRepository.insert(CryptoCoinsTestData.cryptoCoins);
        await UsersCryptoCoinsRepository.insert([{ crypto_coin_id: cryptoCoinId, user_id: userId }]);

        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, BAD_REQUEST);
        assert.strictEqual(message, 'Some of the provided coins already belong to the user');
      });

      it('Should throw an error if the user is trying to add coins to a different user', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/123/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, FORBIDDEN);
        assert.strictEqual(message, 'It\'s not allowed to add coins to another user');
      });

      it('Should throw an error when the crypto coins resource fails', async () => {
        sandbox.stub(axios, 'get').rejects();

        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .set('TOKEN', UsersTestData.token)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, BAD_GATEWAY);
        assert.strictEqual(message, 'Internal error, please contact administrator');
      });

      it('Should throw an error if the token user does not exist', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/${UsersTestData.invalidUserId}/crypto-coins`)
          .set('TOKEN', UsersTestData.invalidUserToken)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, NOT_FOUND);
        assert.strictEqual(message, `User with id ${UsersTestData.invalidUserId} not found`);
      });

      it('Should throw an error if no token is provided', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .post(`${USERS_PATH}/${userId}/crypto-coins`)
          .send(UsersTestData.successfulAddCryptoCoinsBody);

        assert.strictEqual(status, UNAUTHORIZED);
        assert.strictEqual(message, 'Unauthorized');
      });
    });
  });

  describe('Gets top crypto coins', () => {
    beforeEach(async () => {
      ([{ id: userId }] = await UsersRepository.insert([UsersTestData.user]));
    });

    describe('Should work correctly', () => {
      describe('When the user has no crypto coins', () => {
        beforeEach(async () => {
          ({ body: responseBody, status: responseStatus } = await chai.request(app)
            .get(`${USERS_PATH}/${userId}/crypto-coins/top`)
            .set('TOKEN', UsersTestData.token)
          );
        });

        it('Should return an OK status', () => {
          assert.strictEqual(responseStatus, OK);
        });

        it('Should return an empty array', () => {
          assert.deepStrictEqual(responseBody, []);
        });
      });

      describe('When the user has crypto coins', () => {
        beforeEach(async () => {
          const insertedCryptoCoins = await CryptoCoinsRepository.insert(CryptoCoinsTestData.cryptoCoins);
          const usersCryptoCoinsInfo = insertedCryptoCoins.map(
            ({ id: cryptoCoinId }) => ({ crypto_coin_id: cryptoCoinId, user_id: userId }),
          );
          await UsersCryptoCoinsRepository.insert(usersCryptoCoinsInfo);

          const axiosStub = sandbox.stub(axios, 'get');

          const arsCall = 0;
          const eurCall = 1;
          const usdCall = 2;

          axiosStub.onCall(arsCall).resolves(CryptoCoinsTestData.geckoCoinsInfoByIdArs);
          axiosStub.onCall(eurCall).resolves(CryptoCoinsTestData.geckoCoinsInfoByIdEur);
          axiosStub.onCall(usdCall).resolves(CryptoCoinsTestData.geckoCoinsInfoByIdUsd);
        });

        it('Should return an OK status', async () => {
          const { status } = await chai.request(app)
            .get(`${USERS_PATH}/${userId}/crypto-coins/top`)
            .query(CryptoCoinsTestData.getTopCryptoCoinsInfoQuery)
            .set('TOKEN', UsersTestData.token);
          assert.strictEqual(status, OK);
        });

        it('Should return the top cryptoCoinsInfo order desc', async () => {
          const { body } = await chai.request(app)
            .get(`${USERS_PATH}/${userId}/crypto-coins/top`)
            .query(CryptoCoinsTestData.getTopCryptoCoinsInfoQuery)
            .set('TOKEN', UsersTestData.token);
          assert.includeDeepOrderedMembers(body, CryptoCoinsTestData.expectedTopCryptoCoinsInfo);
        });

        it('Should return the top cryptoCoinsInfo order asc', async () => {
          const { body } = await chai.request(app)
            .get(`${USERS_PATH}/${userId}/crypto-coins/top`)
            .query({ ...CryptoCoinsTestData.getTopCryptoCoinsInfoQuery, order: 'asc' })
            .set('TOKEN', UsersTestData.token);
          assert.includeDeepOrderedMembers(body, CryptoCoinsTestData.expectedTopCryptoCoinsInfo.slice().reverse());
        });
      });
    });

    describe('Should fail correctly', () => {
      it('Should throw an error when the user id is different from the logged in', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .get(`${USERS_PATH}/123/crypto-coins/top`)
          .query({ ...CryptoCoinsTestData.getTopCryptoCoinsInfoQuery, order: 'asc' })
          .set('TOKEN', UsersTestData.token);

        assert.strictEqual(status, FORBIDDEN);
        assert.strictEqual(message, 'Forbidden');
      });

      it('Should throw an error when the is not found', async () => {
        const { status, body: { error: { message } } } = await chai.request(app)
          .get(`${USERS_PATH}/${UsersTestData.invalidUserId}/crypto-coins/top`)
          .query({ ...CryptoCoinsTestData.getTopCryptoCoinsInfoQuery, order: 'asc' })
          .set('TOKEN', UsersTestData.invalidUserToken);

        assert.strictEqual(status, NOT_FOUND);
        assert.strictEqual(message, 'Not found');
      });
    });
  });
});
