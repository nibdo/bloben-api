// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/admin/login';

describe(`Get admin account [GET] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    await seedUsers();
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .get(PATH)
      .set('token', token)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .get(PATH)
      .set('token', wrongToken)
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
