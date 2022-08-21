import { LOCATION_PROVIDER } from '../../../../../bloben-interface/enums';
import { createAdminTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { createWrongAdminToken } from '../../../../testHelpers/getTestUser';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/admin/server-settings';

describe(`Patch server settings [PATCH] ${PATH}`, async function () {
  let token;
  let wrongToken;
  beforeEach(async () => {
    const { jwtToken } = await seedAdminUser();
    token = jwtToken;
    wrongToken = await createWrongAdminToken();
  });

  it('Should get status 401', async function () {
    const response: any = await request(
      createAdminTestServerWithSession()
    ).patch(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401 wrong token', async function () {
    const response: any = await request(createAdminTestServerWithSession())
      .patch(PATH)
      .set('token', wrongToken);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createAdminTestServerWithSession())
      .patch(PATH)
      .set('token', token)
      .send({
        emailCounter: 1,
        locationProvider: LOCATION_PROVIDER.OPEN_STREET_MAPS,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
