import { authenticator } from 'otplib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createAdminTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../../seeds/0-adminUser-seed';

const PATH = '/api/v1/admin/user/2fa/enable';

describe(`Admin enable two factor [POST] ${PATH}`, async function () {
  let token;
  let wrongToken;
  let tokenWith2FA;
  let secret;

  beforeEach(async () => {
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
    wrongToken = await createWrongAdminToken();

    secret = authenticator.generateSecret();
    const data = await seedAdminUser({
      twoFactorSecret: secret,
    });
    tokenWith2FA = data.jwtToken;
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();
    const correctCode = authenticator.generate(secret);

    const response: any = await request(server)
      .post(PATH)
      .set('token', tokenWith2FA)
      .send({
        otpCode: correctCode,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', tokenWith2FA)
      .send({
        otpCode: '123456',
      });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 two factor missing', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        otpCode: '123456',
      });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', wrongToken)
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
