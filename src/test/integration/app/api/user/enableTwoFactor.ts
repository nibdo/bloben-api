import { authenticator } from 'otplib';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { seedUserWithEntity } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/users/2fa';

describe(`Enable two factor [POST] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    const { user, demoUser } = await seedUserWithEntity();
    userID = user.id;
    demoUserID = demoUser.id;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(userID);

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
    const server: any = createTestServerWithSession(demoUserID);

    await request(server).get('/v1/user/2fa/generate');

    const response: any = await request(server)
      .post(PATH)
      .send({ otpCode: '125698' });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 409 with wrong code', async function () {
    const server: any = createTestServerWithSession(userID);

    await request(server).get('/v1/user/2fa/generate');

    const response: any = await request(server)
      .post(PATH)
      .send({ otpCode: '125698' });

    const { status } = response;

    assert.equal(status, 401);
  });
});
