const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../../seeds/init';
import { invalidUUID } from '../../../../../testHelpers/common';

const PATH = '/api/v1/calendars/shared';

const testBody = {
  name: 'Shared calendar',
  calDavCalendars: [],
  webcalCalendars: [],
  expireAt: null,
  password: null,
  settings: {},
};

describe(`Create shared calendar [POST] ${PATH}`, async function () {
  let calendarID;
  let webcalCalendarID;
  beforeEach(async () => {
    const { calDavCalendar, webcalCalendar } = await initSeeds();
    calendarID = calDavCalendar.id;
    webcalCalendarID = webcalCalendar.id;
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

  it('Should get status 404 CalDAV', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send({ ...testBody, calDavCalendars: [invalidUUID] });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 404 webcal', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send({ ...testBody, webcalCalendars: [invalidUUID] });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession())
      .post(PATH)
      .send({
        ...testBody,
        calDavCalendars: [calendarID],
        webcalCalendars: [webcalCalendarID],
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
