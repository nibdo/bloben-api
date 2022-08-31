import { authenticator } from 'otplib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { TEST_USER_PASSWORD, seedUser } from '../../../../seeds/1-user-seed';
import { createTestServer } from '../../../../../testHelpers/initTestServer';

const PATH = '/api/app/v1/auth/two-factor/login';

describe(`Login with two factor [POST] ${PATH}`, async function () {
  let username;
  let usernameWithoutTwoFactor;
  let secret;

  beforeEach(async () => {
    const data = await seedUser();
    usernameWithoutTwoFactor = data.username;

    secret = authenticator.generateSecret();
    const data2 = await seedUser({
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    });
    username = data2.username;
  });

  it('Should get status 401 wrong password', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: username,
      password: 'abcde',
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: 'abcde',
      password: 'abcde',
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 409 missing two factor', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: usernameWithoutTwoFactor,
      password: TEST_USER_PASSWORD,
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 wrong code', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: username,
      password: TEST_USER_PASSWORD,
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 200', async function () {
    const server: any = createTestServer();
    const correctCode = authenticator.generate(secret);

    const response: any = await request(server).post(PATH).send({
      username: username,
      password: TEST_USER_PASSWORD,
      otpCode: correctCode,
    });

    const { status } = response;

    assert.equal(status, 200);
  });
});
