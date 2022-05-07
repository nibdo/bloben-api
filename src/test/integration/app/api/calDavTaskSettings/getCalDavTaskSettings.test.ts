const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';

const PATH = '/api/v1/caldav-task/settings';

describe(`Get calDav task settings [GET] ${PATH}`, async function () {
  let calDavCalendarID;
  beforeEach(async () => {
    const { calDavCalendar } = await initSeeds();
    calDavCalendarID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).get(PATH).send();

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(true))
      .get(PATH)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .get(PATH)
      .send();

    const { status } = response;

    assert.equal(status, 200);
  });
});
