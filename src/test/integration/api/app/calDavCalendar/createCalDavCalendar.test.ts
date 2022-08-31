import { mockTsDav } from '../../../../__mocks__/tsdav';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedCalDavCalendars } from '../../../seeds/3-calDavCalendars';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/app/v1/caldav-calendars';

const testBody = {
  name: 'GGG1234111',
  color: '#795548ff',
  components: ['VEVENT', 'VJOURNAL'],
};

describe(`Create calDav calendar [POST] ${PATH}`, async function () {
  let accountID;
  let userID;
  let demoUserID;

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavAccount } = await seedCalDavCalendars(userID);
    accountID = calDavAccount.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(testBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 403 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send(testBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    mockTsDav();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, accountID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    mockTsDav();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, accountID });

    const { status } = response;

    assert.equal(status, 200);
  });
});
