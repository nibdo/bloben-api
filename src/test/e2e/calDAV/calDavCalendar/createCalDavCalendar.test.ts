import { initSeeds } from '../../seeds/init';
import { createE2ETestServerWithSession } from '../../../testHelpers/initE2ETestServer';
import { invalidUUID } from '../../../testHelpers/common';

const request = require('supertest');
const assert = require('assert');

const PATH = '/api/v1/caldav-calendars';

const testBody = {
  name: 'GGG1234111',
  color: '#795548ff',
  components: ['VEVENT', 'VJOURNAL'],
};

describe(`[E2E] Create calDav calendar [POST] ${PATH}`, async function () {
  let accountID;
  beforeEach(async () => {
    const { calDavAccount } = await initSeeds();
    accountID = calDavAccount.id;
  });

  it('Should get status 404', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({ ...testBody, accountID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createE2ETestServerWithSession())
      .post(PATH)
      .send({ ...testBody, accountID });

    const { status } = response;

    assert.equal(status, 200);
  });
});
