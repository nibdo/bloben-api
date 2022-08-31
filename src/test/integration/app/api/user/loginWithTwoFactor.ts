import { authenticator } from 'otplib';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  TWO_FACTOR_SECRET,
  seedUsers,
  testUserDataWithTwoFactor,
} from '../../../seeds/1-user-seed';
import { createTestServer } from '../../../../testHelpers/initTestServer';

const PATH = '/api/app/v1/users/2fa/login';

describe(`Login user [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await seedUsers();
  });

  it('Should get status 200', async function () {
    const server: any = createTestServer();

    const loginResponse: any = await request(server)
      .post('/v1/user/login')
      .send({
        username: testUserDataWithTwoFactor.username,
        password: testUserDataWithTwoFactor.password,
      });

    const otpCode: string = authenticator.generate(TWO_FACTOR_SECRET);

    const response: any = await request(server)
      .post(PATH)
      .set('Cookie', loginResponse.header['Cookie']?.[0])
      .send({ otpCode });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, true);
  });

  it('Should get status 401 with wrong code', async function () {
    const server: any = createTestServer();

    const loginResponse: any = await request(server)
      .post('/v1/user/login')
      .send({
        username: testUserDataWithTwoFactor.username,
        password: testUserDataWithTwoFactor.password,
      });

    const response: any = await request(server)
      .post(PATH)
      .set('Cookie', loginResponse.header['cookie']?.[0])
      .send({ otpCode: '123941' });

    const { status } = response;

    assert.equal(status, 401);
  });
});
