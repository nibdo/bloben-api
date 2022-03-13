const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../utils/initTestServer';
import { initSeeds } from '../../../seeds/init';
import { initCalDavMock } from '../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../__mocks__/tsdav';
import { ImportMock } from 'ts-mock-imports';
import { invalidUUID } from '../adminUsers/adminUpdateUser.test';
import { testTodoIcalString } from '../../../seeds/7-calDavTasks';

const PATH = '/api/v1/caldav-tasks';

describe(`Update calDav task [PUT] ${PATH}`, async function () {
  let mockManager;
  let calDavTask;
  before(async () => {
    mockManager = initCalDavMock();
  });

  beforeEach(async () => {
    const { task } = await initSeeds();
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
    const response: any = await request(createTestServerWithSession())
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
    mockManager = mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession())
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
    mockManager = mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true))
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
    const response: any = await request(createTestServerWithSession())
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
    const response: any = await request(createTestServerWithSession())
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
