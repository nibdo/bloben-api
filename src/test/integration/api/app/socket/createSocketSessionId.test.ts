import { CreateSocketSessionRequest } from '../../../../../bloben-interface/socket/socket';

import { v4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/1-user-seed';

const PATH = '/api/app/v1/socket';

const data: CreateSocketSessionRequest = {
  clientSessionId: v4(),
};

describe(`Socket session [POST] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200 demo user', async function () {
    const response: any = await request(createTestServerWithSession(demoUserID))
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 200', async function () {
    const response: any = await request(createTestServerWithSession(userID))
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 401', async function () {
    const response: any = await request(createTestServer())
      .post(PATH)
      .send(data);

    const { status } = response;

    assert.equal(status, 401);
  });
});
