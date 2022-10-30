import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/user-seed';
import { seedWebcal } from '../../../seeds/webcal';
import { v4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = (id: string) => `/api/app/v1/webcal/calendars/${id}`;

const data: any = {
  name: 'Test cal',
  color: 'indigo',
  url: 'http://localhost:3002',
  syncFrequency: 180,
  alarms: [
    {
      amount: 10,
      timeUnit: 'minutes',
    },
  ],
};

describe(`Update calendar [PUT] ${PATH}`, async function () {
  let calendarID: string;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const webcalCalendar = await seedWebcal(userID);
    calendarID = webcalCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(calendarID))
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(v4()))
      .send(data);

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 demo', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH(calendarID))
      .send(data);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(calendarID))
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });
});
