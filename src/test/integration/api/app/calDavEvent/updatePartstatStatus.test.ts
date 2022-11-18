import { seedCalDavEvents } from '../../../seeds/calDavEvents';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { ATTENDEE_PARTSTAT } from '../../../../../data/types/enums';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { invalidUUID } from '../../../../testHelpers/common';
import { seedUsers } from '../../../seeds/user-seed';

const PATH = (eventID: string) => `/api/app/v1/caldav-events/${eventID}`;

describe(`Update partstat status [PATCH] ${PATH}`, async function () {
  let calDavEvent;
  let userID;
  let demoUserID;
  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { event } = await seedCalDavEvents(userID);
    calDavEvent = event;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .patch(PATH(calDavEvent.id))
      .send({
        status: ATTENDEE_PARTSTAT.ACCEPTED,
        sendInvite: false,
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .patch(PATH(invalidUUID))
      .send({
        status: ATTENDEE_PARTSTAT.ACCEPTED,
        sendInvite: false,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .patch(PATH(calDavEvent.id))
      .send({
        status: ATTENDEE_PARTSTAT.ACCEPTED,
        sendInvite: false,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .patch(PATH(calDavEvent.id))
      .send({
        status: ATTENDEE_PARTSTAT.ACCEPTED,
        sendInvite: false,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
