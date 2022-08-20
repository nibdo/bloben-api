// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { ImportMock } from 'ts-mock-imports';
import { REPEATED_EVENT_CHANGE_TYPE } from '../../../../../bloben-interface/enums';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { invalidUUID } from '../../../../testHelpers/common';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedCalDavEvents } from '../../../seeds/4-calDavEvents';
import { seedUsers } from '../../../seeds/1-user-seed';
import CalDavEventEntity from '../../../../../data/entity/CalDavEventEntity';

const PATH = '/api/v1/caldav-events/repeated';

const createBaseBody = (calDavEvent: CalDavEventEntity) => {
  return {
    id: calDavEvent.id,
    type: REPEATED_EVENT_CHANGE_TYPE.SINGLE,
    calendarID: calDavEvent.calendarID,
    url: calDavEvent.href,
    etag: calDavEvent.etag,
    iCalString: null,
    recurrenceID: null,
    exDates: null,
  };
};

describe(`Delete repeated calDav event [DELETE] ${PATH}`, async function () {
  let calDavEvent;
  let userID;
  let demoUserID;

  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { repeatedEvent } = await seedCalDavEvents(userID);
    calDavEvent = repeatedEvent;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send({ ...createBaseBody(calDavEvent), id: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200 single', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 all', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send(createBaseBody(calDavEvent));

    const { status } = response;

    assert.equal(status, 200);
  });
});
