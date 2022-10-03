import { invalidUUID } from '../../../../testHelpers/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedTasks, testTodoIcalString } from '../../../seeds/7-calDavTasks';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/app/v1/caldav-tasks';

describe(`Update calDav task [PUT] ${PATH}`, async function () {
  let calDavTask;
  before(async () => {
    initCalDavMock();
  });

  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { task } = await seedTasks(userID);
    calDavTask = task;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer()).put(PATH).send({
      calendarID: calDavTask.calendar.id,
      externalID: calDavTask.externalID,
      iCalString: testTodoIcalString,
      id: calDavTask.id,
      etag: 'CTGARAF',
      url: calDavTask.href,
      prevEvent: null,
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        calendarID: invalidUUID,
        externalID: calDavTask.externalID,
        iCalString: testTodoIcalString,
        id: calDavTask.id,
        etag: 'CTGARAF',
        url: calDavTask.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavTask.externalID,
        calendarID: calDavTask.calendar.id,
        iCalString: testTodoIcalString,
        id: calDavTask.id,
        etag: 'CTGARAF',
        url: calDavTask.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH)
      .send({
        externalID: calDavTask.externalID,
        calendarID: calDavTask.calendar.id,
        iCalString: testTodoIcalString,
        id: calDavTask.id,
        etag: 'CTGARAF',
        url: calDavTask.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    mockTsDav();

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavTask.externalID,
        calendarID: calDavTask.calendar.id,
        iCalString: testTodoIcalString,
        id: calDavTask.id,
        etag: 'CTGARAF',
        url: calDavTask.href,
        prevEvent: null,
      });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200 with changed calendar', async function () {
    mockTsDav();

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH)
      .send({
        externalID: calDavTask.externalID,
        calendarID: calDavTask.calendar.id,
        iCalString: testTodoIcalString,
        id: calDavTask.id,
        etag: 'CTGARAF',
        url: calDavTask.href,
        prevEvent: {
          externalID: calDavTask.externalID,
          id: calDavTask.id,
          url: calDavTask.href,
          etag: 'CTGARAF',
        },
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
