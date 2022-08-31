import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';

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
import { seedCalDavCalendars } from '../../../seeds/3-calDavCalendars';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = (id: string) => `/api/app/v1/caldav-accounts/${id}`;

describe(`Update calDav account [PUT] ${PATH}`, async function () {
  let calDavAccountID;
  let userID;
  let demoUserID;

  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
    const { calDavAccount } = await seedCalDavCalendars(userID);
    calDavAccountID = calDavAccount.id;
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 404 not found', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(invalidUUID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 404);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .put(PATH(calDavAccountID))
      .send({
        password: 'abcde',
      });

    const { status } = response;

    assert.equal(status, 200);
  });
});
