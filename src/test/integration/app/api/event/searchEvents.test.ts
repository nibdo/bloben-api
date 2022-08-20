// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedCalDavEvents } from '../../../seeds/4-calDavEvents';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (summary: string) => `/api/v1/events/search?summary=${summary}`;

describe(`Search events [GET] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  let summary;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { event } = await seedCalDavEvents(userID);
    summary = event.summary;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(
      `${PATH('abc')}`
    );

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).get(`${PATH('abc')}`);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 no result', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(`${PATH('abc123')}`);

    const { status, body } = response;

    assert.equal(status, 200);
    assert.equal(body.length, 0);
  });

  it('Should get status 200 found event', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).get(`${PATH(summary)}`);

    const { status, body } = response;

    assert.equal(status, 200);
    assert.notEqual(body.length, 0);
  });
});
