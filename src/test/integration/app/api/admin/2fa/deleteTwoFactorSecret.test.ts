// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createAdminTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../../seeds/0-adminUser-seed';

const PATH = '/api/v1/admin/user/2fa';

describe(`Admin delete two factor [DELETE] ${PATH}`, async function () {
  let token;
  let wrongToken;

  beforeEach(async () => {
    const { jwtToken } = await seedAdminUser({ isTwoFactorEnabled: true });
    token = jwtToken;
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 200', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH)
      .set('token', token)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createAdminTestServerWithSession();

    const response: any = await request(server)
      .delete(PATH)
      .set('token', wrongToken)
      .send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
