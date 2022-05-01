import {invalidUUID} from "../../../../testHelpers/common";

const request = require('supertest');
const assert = require('assert');
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initSeeds } from '../../../seeds/init';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { ImportMock } from 'ts-mock-imports';

const PATH = '/api/v1/caldav-tasks';

describe(`Delete calDav task [DELETE] ${PATH}`, async function () {
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
    const response: any = await request(createTestServerWithSession())
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
    mockManager = mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession())
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
    mockManager = mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(true))
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
    const response: any = await request(createTestServerWithSession())
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
