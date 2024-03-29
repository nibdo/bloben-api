import { seedUsers } from '../../../seeds/user-seed';

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavCalendars } from '../../../seeds/calDavCalendars';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/caldav-task/settings';

describe(`Get calDav task settings [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    await seedCalDavCalendars(userID);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .get(PATH)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .get(PATH)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
