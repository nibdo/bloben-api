import { LOCATION_PROVIDER } from '../../../../../data/types/enums';
import { createTestServerWithSession } from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedAdminUser } from '../../../seeds/0-adminUser-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/admin/v1/server-settings';

describe(`Patch server settings [PATCH] ${PATH}`, async function () {
  let adminID;
  beforeEach(async () => {
    const { id } = await seedAdminUser();
    adminID = id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(
      createTestServerWithSession(invalidUUID)
    ).patch(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 401 wrong token', async function () {
    const response: any = await request(
      createTestServerWithSession(invalidUUID)
    ).patch(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(adminID))
      .patch(PATH)
      .send({
        emailCounter: 1,
        locationProvider: LOCATION_PROVIDER.OPEN_STREET_MAPS,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
