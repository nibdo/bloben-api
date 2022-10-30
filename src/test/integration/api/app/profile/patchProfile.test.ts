// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import {
  createTestServer,
  createTestServerWithSession,
} from '../../../../testHelpers/initTestServer';
import { seedUsers } from '../../../seeds/user-seed';

const PATH = '/api/app/v1/profile/';

describe(`Patch profile [PATCH] ${PATH}`, async function () {
  let userID;
  let demoUserID;
  beforeEach(async () => {
    [userID, demoUserID] = await seedUsers();
  });

  it('Should get status 401', async function () {
    const server: any = createTestServer();

    const response: any = await request(server).patch(PATH).send({
      language: 'en',
    });

    const { status } = response;

    assert.equal(status, 401);
  });

  it('Should get status 200', async function () {
    const server: any = createTestServerWithSession(userID);

    const response: any = await request(server).patch(PATH).send({
      language: 'en',
    });

    const { status } = response;

    assert.equal(status, 200);
  });

  it('Should get status 403 forbidden', async function () {
    const server: any = createTestServerWithSession(demoUserID);

    const response: any = await request(server).patch(PATH).send({
      language: 'en',
    });

    const { status } = response;

    assert.equal(status, 403);
  });
});
