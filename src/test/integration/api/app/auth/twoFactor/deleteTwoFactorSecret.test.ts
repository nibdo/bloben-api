import { seedUsers } from '../../../../seeds/user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { createTestServerWithSession } from '../../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../../testHelpers/common';

const PATH = '/api/app/v1/auth/two-factor';

describe(`Delete two factor [DELETE] ${PATH}`, async function () {
  let userID;
  beforeEach(async () => {
    [userID] = await seedUsers();
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401 wrong token', async function () {
    const server: any = createTestServerWithSession(invalidUUID);

    const response: any = await request(server).delete(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });
});
