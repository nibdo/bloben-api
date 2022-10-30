import { authenticator } from 'otplib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../../testHelpers/common';
import { seedUser } from '../../../../seeds/user-seed';

const PATH = '/api/app/v1/auth/two-factor/enable';

describe(`Enable two factor [POST] ${PATH}`, async function () {
  let idWith2FA;
  let secret;
  let userID;

  beforeEach(async () => {
    const { id } = await seedUser();
    userID = id;

    secret = authenticator.generateSecret();
    const data = await seedUser({
      twoFactorSecret: secret,
    });
    idWith2FA = data.id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(idWith2FA);
    const correctCode = authenticator.generate(secret);

    const response: any = await request(server).post(PATH).send({
      otpCode: correctCode,
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409', async function () {
    const server: any = createTestServerWithSession(idWith2FA);

    const response: any = await request(server).post(PATH).send({
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 two factor missing', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).post(PATH).send({
      otpCode: '123456',
    });

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).post(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
