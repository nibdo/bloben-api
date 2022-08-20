import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { invalidUUID } from '../../../testHelpers/common';
import { seedUsersE2E } from '../../seeds/1-user-caldav-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/v1/caldav-calendars';

const testBody = {
  name: 'GGG1234111',
  color: '#795548ff',
  components: ['VEVENT', 'VJOURNAL'],
};

describe(`[E2E] Create calDav calendar [POST] ${PATH}`, async function () {
  let userID;
  let accountID;
  beforeEach(async () => {
    const { userData } = await seedUsersE2E();
    userID = userData.user.id;
    accountID = userData.calDavAccount.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, accountID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, accountID });

    const { status } = response;

    assert.equal(status, 200);
  });
});
