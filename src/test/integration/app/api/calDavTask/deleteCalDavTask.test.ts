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
import { seedTasks } from '../../../seeds/7-calDavTasks';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/caldav-tasks';

describe(`Delete calDav task [DELETE] ${PATH}`, async function () {
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
    const response: any = await request(createTestServer()).delete(PATH).send({
      calendarID: calDavTask.calendar.id,
      id: invalidUUID,
      etag: 'CTGARAF',
      url: calDavTask.href,
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID: invalidUUID,
        id: invalidUUID,
        etag: 'CTGARAF',
        url: calDavTask.href,
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID: calDavTask.calendar.id,
        id: invalidUUID,
        etag: 'CTGARAF',
        url: calDavTask.href,
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .delete(PATH)
      .send({
        calendarID: calDavTask.calendar.id,
        id: invalidUUID,
        etag: 'CTGARAF',
        url: calDavTask.href,
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .delete(PATH)
      .send({
        calendarID: calDavTask.calendar.id,
        id: invalidUUID,
        etag: 'CTGARAF',
        url: calDavTask.href,
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
