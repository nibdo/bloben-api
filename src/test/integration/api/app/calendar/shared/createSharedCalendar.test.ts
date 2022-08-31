import { seedUsers } from '../../../../seeds/1-user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../../testHelpers/initTestServer';
import { invalidUUID } from '../../../../../testHelpers/common';
import { seedCalDavCalendars } from '../../../../seeds/3-calDavCalendars';
import { seedWebcal } from '../../../../seeds/6-webcal';

const PATH = '/api/app/v1/calendars/shared';

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
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const webcalCalendarEntity = await seedWebcal(userID);
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    calendarID = calDavCalendar.id;
    webcalCalendarID = webcalCalendarEntity.id;
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

  it('Should get status 404 CalDAV', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, calDavCalendars: [invalidUUID] });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 404 webcal', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...testBody, webcalCalendars: [invalidUUID] });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
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
