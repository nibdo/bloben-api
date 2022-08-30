import { invalidUUID } from '../../../../testHelpers/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { DateTime } from 'luxon';
import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedCalDavEvents } from '../../../seeds/4-calDavEvents';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/app/v1/caldav-events/${id}/duplicate`;

describe(`Duplicate calDav event [POST] ${PATH}`, async function () {
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
      .post(PATH(calDavEvent.id))
      .send({
        dates: [DateTime.now().toString()],
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(invalidUUID))
      .send({
        dates: [DateTime.now().toString()],
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(calDavEvent.id))
      .send({
        dates: [DateTime.now().toString()],
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH(calDavEvent.id))
      .send({
        dates: [DateTime.now().toString()],
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH(calDavEvent.id))
      .send({
        dates: [DateTime.now().toString()],
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
