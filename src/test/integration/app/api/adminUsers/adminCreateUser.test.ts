// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUserWithEntity } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/admin/users';

describe(`Create user admin [POST] ${PATH}`, async function () {
  let token;
  let user;
  let wrongToken;
  beforeEach(async () => {
    const data = await seedUserWithEntity();
    user = data.user;
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        username: 'vbde1',
        password: 'root22',
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 409 user exists', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', token)
      .send({
        username: user.username,
        password: 'afsazxczxcf',
      });

    const { status } = response;
    assert.equal(status, 409);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .post(PATH)
      .set('token', wrongToken)
      .send({
        username: 'test_user123',
        password: 'afsazxczxcf',
      });

    const { status } = response;

    assert.equal(status, 401);
  });
});
