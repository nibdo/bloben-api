import {initSeeds} from "../../../seeds/init";

const request = require('supertest');
const assert = require('assert');
import { authenticator } from 'otplib';

import {
  TWO_FACTOR_SECRET,
  testUserDataWithTwoFactor,
} from '../../../seeds/1-user-seed';
import { createTestServer } from '../../../utils/initTestServer';

const PATH = '/api/v1/users/2fa/login';

describe(`Login user [POST] ${PATH}`, async function () {
  beforeEach(async () => {
    await initSeeds();
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
