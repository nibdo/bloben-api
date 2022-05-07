import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');
import { authenticator } from 'otplib';

import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';

const PATH = '/api/v1/users/2fa';

describe(`Enable two factor [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession();

    const enableTwoFactorResponse: any = await request(server).get(
      '/v1/user/2fa/generate'
    );

    const secret: string = enableTwoFactorResponse.body.twoFactorSecret;

    const otpCode: string = authenticator.generate(secret);

    const response: any = await request(server).post(PATH).send({ otpCode });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(true);

    await request(server).get('/v1/user/2fa/generate');

    const response: any = await request(server)
        .post(PATH)
        .send({ otpCode: '125698' });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 409 with wrong code', async function () {
    const server: any = createTestServerWithSession();

    await request(server).get('/v1/user/2fa/generate');

    const response: any = await request(server)
      .post(PATH)
      .send({ otpCode: '125698' });

    const { status } = response;

    assert.equal(status, 401);
  });
});
