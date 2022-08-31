// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  TEST_USER_PASSWORD,
  seedUserWithEntity,
} from '../../../seeds/1-user-seed';
import { createTestServer } from '../../../../testHelpers/initTestServer';

const PATH = '/api/app/v1/users/login';

describe(`Login user [POST] ${PATH}`, async function () {
  let user;
  let demoUser;
  beforeEach(async () => {
    const data = await seedUserWithEntity();
    user = data.user;
    demoUser = data.demoUser;
  });

  it('Should get status 200', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: user.username,
      password: TEST_USER_PASSWORD,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 200 demo user', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: demoUser.username,
      password: TEST_USER_PASSWORD,
    });

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.isLogged, true);
    assert.equal(body.isTwoFactorEnabled, false);
  });

  it('Should get status 429 too many requests', async function () {
    const server: any = createTestServer();

    await request(server).post(PATH).set('X-Real-IP', '13213').send({
      username: user.username,
      password: 'abcde',
    });

    const response: any = await request(server)
      .post(PATH)
      .set('X-Real-IP', '13213')
      .send({
        username: user.username,
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 429);
  });

  it('Should get status 401 with wrong password', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: user.username,
      password: 'afsaf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401 with wrong user', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).post(PATH).send({
      username: 'asfafafa',
      password: 'afsaf',
    });

    const { status } = response;

    assert.equal(status, 401);
  });
});
