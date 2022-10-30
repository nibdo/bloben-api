import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/server-settings/user';

describe(`Get server settings user [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(PATH);

    const { status } = response;

    assert.equal(status, 200);
  });
});
