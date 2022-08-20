import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/1-user-seed';
import { seedWebcal } from '../../../seeds/6-webcal';
import { v4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = `/api/v1/webcal/calendars`;

describe(`Delete calendar [DELETE] ${PATH}/:calendarID`, async function () {
  let calendarID: string;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const webcalCalendar = await seedWebcal(userID);
    calendarID = webcalCalendar.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).delete(
      `${PATH}/${calendarID}`
    );

    const { status } = response;

    assert.equal(status, 401);
  });
  it('Should get status 404 not found', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).delete(`${PATH}/${v4()}`);

    const { status } = response;

    assert.equal(status, 404);
  });
  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).delete(`${PATH}/${calendarID}`);

    const { status } = response;

    assert.equal(status, 200);
  });
  it('Should get status 200', async function () {
    const response: any = await request(
      createTestServerWithSession(userID)
    ).delete(`${PATH}/${calendarID}`);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 demo', async function () {
    const response: any = await request(
      createTestServerWithSession(demoUserID)
    ).delete(`${PATH}/${calendarID}`);

    const { status } = response;

    assert.equal(status, 403);
  });
});
