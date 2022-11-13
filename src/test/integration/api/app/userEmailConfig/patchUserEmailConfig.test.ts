import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { mockNodemailer } from '../../../../__mocks__/nodemailer';
import { seedCalDavCalendars } from '../../../seeds/calDavCalendars';
import { seedUsers } from '../../../seeds/user-seed';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/users/email-config';

describe(`Patch user email config [PATCH] ${PATH}`, async function () {
  before(async () => {
    await mockNodemailer();
  });

  let calendarForImportID;
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavCalendar } = await seedCalDavCalendars(userID);
    calendarForImportID = calDavCalendar.id;
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server)
      .patch(PATH)
      .send({ calendarForImportID });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 existing config', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server)
      .patch(PATH)
      .send({ calendarForImportID });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 ', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server)
      .patch(PATH)
      .send({ calendarForImportID });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server)
      .patch(PATH)
      .send({ calendarForImportID });

    const { status } = response;

    assert.equal(status, 403);
  });
});
