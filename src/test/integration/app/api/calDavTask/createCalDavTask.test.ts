import { createDummyCalDavTask } from '../../../seeds/7-calDavTasks';

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
import { invalidUUID } from '../../../../testHelpers/common';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedCalDavCalendars } from '../../../seeds/3-calDavCalendars';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/v1/caldav-tasks';

describe(`Create calDav task [POST] ${PATH}`, async function () {
  let requestBody;
  before(async () => {
    initCalDavMock();
  });

  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const data = await seedCalDavCalendars(userID);
    requestBody = createDummyCalDavTask(data.calDavCalendar.id);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({ ...requestBody, calendarID: invalidUUID });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(requestBody);

    const { status } = response;

    assert.equal(status, 200);
  });
});
