const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sandbox = require('sinon').createSandbox();

const {
  statusCodes: {
    CREATED, OK, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND, INTERNAL_ERROR,
  },
} = require('../../../src/constants/HttpConstants');
const UsersTestData = require('../../data/UsersTestData');
const UsersRepository = require('../../../src/entities/users/UsersRepository');
const Secrets = require('../../../src/utils/Secrets');
const JWT = require('../../../src/utils/JWT');
const DBTestUtils = require('../../testUtils/DBTestUtils');
const app = require('../../../src/index');

const { API_KEY } = process.env;
chai.use(chaiHttp);

const USERS_PATH = '/users';
const LOGIN_PATH = `${USERS_PATH}/login`;

describe('Users integration tests', () => {
  let responseStatus;
  let responseBody;

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
          const incompleteBody = UsersTestData.getBodyWithoutRequiredProperty(requiredProperty);

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
});
