import { CreateCalDavAccountRequest } from 'bloben-interface';
import { DAV_ACCOUNT_TYPE } from '../../../../../data/types/enums';
import { ImportMock } from 'ts-mock-imports';
import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { initCalDavMock } from '../../../../__mocks__/calDavMock';
import { mockTsDav, mockTsDavUnauthorized } from '../../../../__mocks__/tsdav';
import { seedUsers } from '../../../seeds/1-user-seed';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const PATH = '/api/app/v1/caldav-accounts';

describe(`Create calDav account [POST] ${PATH}`, async function () {
  let userID;
  let demoUserID;

  before(async () => {
    initCalDavMock();
  });

  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 409 already exists', async function () {
    await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost:3111',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost:3111',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 409);
  });

  it('Should get status 409 cannot connect to calDav server', async function () {
    ImportMock.restore();
    mockTsDavUnauthorized();

    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost:3111',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 409);

    ImportMock.restore();
    mockTsDav();
  });

  it('Should get status 403 Forbidden', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 403);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost',
        accountType: DAV_ACCOUNT_TYPE.CALDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send({
        username: 'abecede',
        password: 'fefefefaasfaf',
        url: 'http://localhost',
        accountType: DAV_ACCOUNT_TYPE.CARDDAV,
      } as CreateCalDavAccountRequest);

    const { status } = response;

    assert.equal(status, 200);
  });
});
