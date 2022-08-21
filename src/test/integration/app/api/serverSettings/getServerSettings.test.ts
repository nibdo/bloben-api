import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/admin/server-settings';

describe(`Get server settings [GET] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createAdminTestServerWithSession()).get(
      PATH
    );

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401 wrong token', async function () {
    const response: any = await request(createAdminTestServerWithSession())
      .get(PATH)
      .set('token', wrongToken);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createAdminTestServerWithSession())
      .get(PATH)
      .set('token', token);

    const { status } = response;

    assert.equal(status, 200);
  });
});
