import {mockTsDav} from "../../../../__mocks__/tsdav";

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';
import {invalidUUID} from "../../../../testHelpers/common";

const PATH = '/api/v1/caldav-calendars';

const testBody = {
  name: 'GGG1234111',
  color: '#795548ff',
  components: ['VEVENT', 'VJOURNAL'],
};

describe(`Create calDav calendar [POST] ${PATH}`, async function () {
  let accountID;
  beforeEach(async () => {
    const { calDavAccount } = await initSeeds();
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
    const response: any = await request(createTestServerWithSession(true))
        .post(PATH)
        .send(testBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 404', async function () {
    mockTsDav()

    const response: any = await request(createTestServerWithSession())
        .post(PATH)
        .send({ ...testBody, accountID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    mockTsDav()

    const response: any = await request(createTestServerWithSession())
        .post(PATH)
        .send({ ...testBody, accountID });

    const { status } = response;

    assert.equal(status, 200);
  });
});
